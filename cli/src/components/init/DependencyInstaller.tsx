import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";
import { useState } from "react";

interface DependencyInstallerProps {
	projectName: string;
	onComplete: (installDeps: boolean) => void;
}

export const DependencyInstaller: React.FC<DependencyInstallerProps> = ({
	onComplete,
}) => {
	const [installing, setInstalling] = useState(false);

	const dependencyOptions = [
		{ label: "Yes, install dependencies now (pnpm install)", value: "yes" },
		{ label: "No, I will install them later", value: "no" },
	];

	const handleDependencyChoice = async (item: { value: string }) => {
		const shouldInstall = item.value === "yes";

		if (shouldInstall) {
			setInstalling(true);
			// Simulate installation
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}

		onComplete(shouldInstall);
	};

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
