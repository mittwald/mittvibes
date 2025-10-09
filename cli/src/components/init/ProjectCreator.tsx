import { Box, Text } from "ink";
import type React from "react";
import { useEffect, useState } from "react";
import fs from "fs-extra";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fetch from "node-fetch";
import yauzl from "yauzl";

const pipelineAsync = promisify(pipeline);

interface ProjectCreatorProps {
	projectName: string;
	onComplete: () => void;
	onError: (error: string) => void;
}

async function downloadAndExtractTemplate(projectName: string): Promise<string> {
	const tempDir = path.join(process.cwd(), `${projectName}-temp`);
	const zipPath = path.join(tempDir, "repo.zip");

	await fs.ensureDir(tempDir);

	try {
		const response = await fetch(
			"https://github.com/weissaufschwarz/mittvibes/archive/refs/heads/main.zip",
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
	const [status, setStatus] = useState<
		"downloading" | "extracting" | "updating" | "completed"
	>("downloading");

	useEffect(() => {
		const createProject = async () => {
			try {
				const projectPath = path.join(process.cwd(), projectName);

				if (await fs.pathExists(projectPath)) {
					throw new Error(
						`Directory "${projectName}" already exists in current location`,
					);
				}

				setStatus("downloading");
				const extractedPath = await downloadAndExtractTemplate(projectName);

				setStatus("extracting");
				await fs.copy(extractedPath, projectPath, {
					filter: (src) =>
						!src.includes("node_modules") && !src.includes(".git"),
				});

				await fs.remove(path.join(process.cwd(), `${projectName}-temp`));

				setStatus("updating");
				const packageJsonPath = path.join(projectPath, "package.json");
				const packageJson = await fs.readJson(packageJsonPath);
				packageJson.name = projectName;
				await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

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
				onComplete();
			} catch (error) {
				const tempDir = path.join(process.cwd(), `${projectName}-temp`);
				if (await fs.pathExists(tempDir)) {
					await fs.remove(tempDir);
				}
				onError(error instanceof Error ? error.message : String(error));
			}
		};

		createProject();
	}, [projectName, onComplete, onError]);

	const getStatusText = () => {
		switch (status) {
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

	return (
		<Box flexDirection="column">
			<Text color="yellow">{getStatusText()}</Text>
			{status === "completed" && (
				<Box marginTop={1}>
					<Text color="green">
						Your project "{projectName}" has been created successfully!
					</Text>
				</Box>
			)}
		</Box>
	);
};
