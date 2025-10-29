import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fs from "fs-extra";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import fetch from "node-fetch";
import type React from "react";
import { useEffect, useState } from "react";
import yauzl from "yauzl";

const pipelineAsync = promisify(pipeline);

type ProjectCreationStatus =
	| "checking"
	| "conflict"
	| "renaming"
	| "downloading"
	| "extracting"
	| "updating"
	| "completed";

type ConflictResolution = "none" | "rename" | "wipe";

interface ProjectCreatorProps {
	projectName: string;
	onComplete: (actualFolderName: string) => void;
	onError: (error: string) => void;
}

async function downloadAndExtractTemplate(
	projectName: string,
): Promise<string> {
	const tempDir = path.join(process.cwd(), `${projectName}-temp`);
	const zipPath = path.join(tempDir, "repo.zip");

	await fs.ensureDir(tempDir);

	try {
		const response = await fetch(
			"https://github.com/mittwald/mittvibes/archive/refs/heads/main.zip",
		);
		if (!response.ok) {
			throw new Error(`Failed to download template: ${response.statusText}`);
		}

		if (!response.body) {
			throw new Error("No response body received");
		}

		await pipelineAsync(response.body, createWriteStream(zipPath));

		return new Promise<string>((resolve, reject) => {
			yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
				if (err || !zipfile) {
					reject(err || new Error("Failed to open ZIP file"));
					return;
				}

				zipfile.readEntry();
				zipfile.on("entry", (entry) => {
					if (entry.fileName.startsWith("mittvibes-main/templates/")) {
						const relativePath = entry.fileName.replace(
							"mittvibes-main/templates/",
							"",
						);

						if (relativePath && !entry.fileName.endsWith("/")) {
							const outputPath = path.join(tempDir, "extracted", relativePath);

							fs.ensureDirSync(path.dirname(outputPath));

							zipfile.openReadStream(entry, (err, readStream) => {
								if (err || !readStream) {
									reject(err || new Error("Failed to read ZIP entry"));
									return;
								}

								const writeStream = createWriteStream(outputPath);
								readStream.pipe(writeStream);
								writeStream.on("close", () => {
									zipfile.readEntry();
								});
							});
						} else {
							zipfile.readEntry();
						}
					} else {
						zipfile.readEntry();
					}
				});

				zipfile.on("end", () => {
					resolve(path.join(tempDir, "extracted"));
				});

				zipfile.on("error", reject);
			});
		});
	} finally {
		if (await fs.pathExists(zipPath)) {
			await fs.remove(zipPath);
		}
	}
}

export const ProjectCreator: React.FC<ProjectCreatorProps> = ({
	projectName,
	onComplete,
	onError,
}) => {
	const [status, setStatus] = useState<ProjectCreationStatus>("checking");
	const [conflictResolution, setConflictResolution] =
		useState<ConflictResolution>("none");
	const [newProjectName, setNewProjectName] = useState("");

	// Check for folder conflict on mount
	useEffect(() => {
		const checkFolder = async () => {
			const projectPath = path.join(process.cwd(), projectName);
			if (await fs.pathExists(projectPath)) {
				setStatus("conflict");
			} else {
				setStatus("downloading");
			}
		};
		checkFolder();
	}, [projectName]);

	// Handle project creation based on conflict resolution
	useEffect(() => {
		if (status !== "downloading") return;

		const createProject = async () => {
			try {
				const finalProjectName =
					conflictResolution === "rename" && newProjectName
						? newProjectName
						: projectName;
				const projectPath = path.join(process.cwd(), finalProjectName);

				// If wiping, remove existing folder
				if (
					conflictResolution === "wipe" &&
					(await fs.pathExists(projectPath))
				) {
					await fs.remove(projectPath);
				}

				setStatus("downloading");
				const extractedPath =
					await downloadAndExtractTemplate(finalProjectName);

				setStatus("extracting");
				await fs.copy(extractedPath, projectPath, {
					filter: (src) =>
						!src.includes("node_modules") && !src.includes(".git"),
				});

				await fs.remove(path.join(process.cwd(), `${finalProjectName}-temp`));

				setStatus("updating");
				const packageJsonPath = path.join(projectPath, "package.json");
				const packageJson = await fs.readJson(packageJsonPath);
				packageJson.name = finalProjectName;
				await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

				// Rename _gitignore to .gitignore (can't include .gitignore in npm packages)
				const gitignoreSource = path.join(projectPath, "_gitignore");
				const gitignoreDest = path.join(projectPath, ".gitignore");
				if (await fs.pathExists(gitignoreSource)) {
					await fs.rename(gitignoreSource, gitignoreDest);
				}

				// Recreate CLAUDE.md symlink (GitHub ZIP doesn't preserve symlinks)
				const claudeMdPath = path.join(projectPath, "CLAUDE.md");
				const agentsMdPath = path.join(projectPath, "AGENTS.md");
				if (await fs.pathExists(claudeMdPath)) {
					await fs.remove(claudeMdPath);
				}
				if (await fs.pathExists(agentsMdPath)) {
					await fs.symlink("AGENTS.md", claudeMdPath);
				}

				setStatus("completed");
				onComplete(finalProjectName);
			} catch (error) {
				const finalProjectName =
					conflictResolution === "rename" && newProjectName
						? newProjectName
						: projectName;
				const tempDir = path.join(process.cwd(), `${finalProjectName}-temp`);
				if (await fs.pathExists(tempDir)) {
					await fs.remove(tempDir);
				}
				onError(error instanceof Error ? error.message : String(error));
			}
		};

		createProject();
	}, [
		status,
		projectName,
		newProjectName,
		conflictResolution,
		onComplete,
		onError,
	]);

	const getStatusText = () => {
		switch (status) {
			case "checking":
				return "🔍 Checking project folder...";
			case "conflict":
				return "⚠️  Folder already exists";
			case "renaming":
				return "📝 Enter new folder name";
			case "downloading":
				return "🔄 Downloading project template...";
			case "extracting":
				return "📦 Extracting template files...";
			case "updating":
				return "⚙️  Updating package.json...";
			case "completed":
				return "✅ Project structure created!";
		}
	};

	// Render conflict resolution UI
	if (status === "conflict") {
		const conflictItems = [
			{
				label: "Rename project folder",
				value: "rename",
			},
			{
				label:
					"Delete existing folder and create new project (⚠️  WARNING: Cannot be undone)",
				value: "wipe",
			},
		];

		return (
			<Box flexDirection="column">
				<Text color="yellow">{getStatusText()}</Text>
				<Box marginTop={1}>
					<Text color="white">
						A folder named "{projectName}" already exists in this location.
					</Text>
				</Box>
				<Box marginTop={1}>
					<Text color="white">How would you like to proceed?</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={conflictItems}
						onSelect={(item) => {
							if (item.value === "rename") {
								setStatus("renaming");
							} else if (item.value === "wipe") {
								setConflictResolution("wipe");
								setStatus("downloading");
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	// Render rename input UI
	if (status === "renaming") {
		return (
			<Box flexDirection="column">
				<Text color="yellow">📝 Enter new folder name</Text>
				<Box marginTop={1}>
					<Text color="white">New folder name: </Text>
					<TextInput
						value={newProjectName}
						onChange={setNewProjectName}
						onSubmit={async () => {
							if (!newProjectName.trim()) {
								return;
							}
							// Check if the new name also conflicts
							const newPath = path.join(process.cwd(), newProjectName);
							if (await fs.pathExists(newPath)) {
								onError(
									`Folder "${newProjectName}" also already exists. Please choose a different name.`,
								);
								return;
							}
							setConflictResolution("rename");
							setStatus("downloading");
						}}
					/>
				</Box>
				<Box marginTop={1}>
					<Text color="gray">Press Enter to continue</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text color="yellow">{getStatusText()}</Text>
			{status === "completed" && (
				<Box marginTop={1}>
					<Text color="green">
						Your project "
						{conflictResolution === "rename" && newProjectName
							? newProjectName
							: projectName}
						" has been created successfully!
					</Text>
				</Box>
			)}
		</Box>
	);
};
