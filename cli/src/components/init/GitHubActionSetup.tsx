import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";

interface GitHubActionSetupProps {
	onComplete: (enableGitHubAction: boolean) => void;
}

export const GitHubActionSetup: React.FC<GitHubActionSetupProps> = ({
	onComplete,
}) => {
	const items = [
		{
			label: "Yes - Enable GitHub Action for container builds",
			value: true,
		},
		{
			label: "No - Keep workflow disabled (can enable later)",
			value: false,
		},
	];

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				GitHub Actions CI/CD
			</Text>
			<Box marginTop={1}>
				<Text color="gray">
					The template includes a GitHub Action that automatically builds and
					pushes your container to GitHub Container Registry (ghcr.io) on push
					to main.
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="white">Do you want to enable the GitHub Action?</Text>
			</Box>
			<Box marginTop={1}>
				<SelectInput
					items={items}
					onSelect={(item) => onComplete(item.value)}
				/>
			</Box>
		</Box>
	);
};
