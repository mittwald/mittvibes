import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";
import { useState } from "react";
import { execSync } from "node:child_process";
import path from "node:path";

interface DependencyInstallerProps {
	projectName: string;
	onComplete: (installDeps: boolean) => void;
}

export const DependencyInstaller: React.FC<DependencyInstallerProps> = ({
	projectName,
	onComplete,
}) => {
	const [installing, setInstalling] = useState(false);
	const [error, setError] = useState("");

	const dependencyOptions = [
		{ label: "Yes, install dependencies now (pnpm install)", value: "yes" },
		{ label: "No, I will install them later", value: "no" },
	];

	const handleDependencyChoice = async (item: { value: string }) => {
		const shouldInstall = item.value === "yes";

		if (shouldInstall) {
			setInstalling(true);
			try {
				const projectPath = path.join(process.cwd(), projectName);
				execSync("pnpm install", {
					cwd: projectPath,
					stdio: "inherit",
				});
				onComplete(true);
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
				onComplete(false);
			}
		} else {
			onComplete(false);
		}
	};

	if (error) {
		return (
			<Box flexDirection="column">
				<Text color="red">❌ Failed to install dependencies</Text>
				<Box marginTop={1}>
					<Text color="gray">Error: {error}</Text>
				</Box>
				<Box marginTop={1}>
					<Text color="gray">
						Please run "pnpm install" manually in your project directory.
					</Text>
				</Box>
			</Box>
		);
	}

	if (installing) {
		return (
			<Box flexDirection="column">
				<Text color="yellow">🔄 Installing dependencies with pnpm...</Text>
				<Box marginTop={1}>
					<Text color="gray">This may take a few minutes...</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text>Would you like to install dependencies now?</Text>
			<Box marginTop={1}>
				<SelectInput
					items={dependencyOptions}
					onSelect={handleDependencyChoice}
				/>
			</Box>
		</Box>
	);
};
