import { Box, Text } from "ink";
import type React from "react";
import type { ProjectConfig } from "../InitCommand.js";

interface CompletionScreenProps {
	config: ProjectConfig;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
	config,
}) => {
	if (config.mode === "existing") {
		return (
			<Box flexDirection="column">
				<Text>
					📁 Please navigate to your existing project directory and continue
					from there.
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				🎉 Your mittwald extension is ready for development!
			</Text>

			<Box marginTop={1}>
				<Text color="white" bold>
					Next Steps:
				</Text>
			</Box>
			<Box>
				<Text color="white"> cd {config.projectName}</Text>
			</Box>
			<Box>
				<Text color="white"> pnpm dev</Text>
			</Box>
			<Box>
				<Text color="white">
					{" "}
					• Deploy to public URL (ngrok, cloudflared, etc.)
				</Text>
			</Box>
			<Box>
				<Text color="white"> • Test extension installation in mStudio</Text>
			</Box>

			<Box marginTop={1}>
				<Text color="white" bold>
					Development Workflow:
				</Text>
			</Box>
			<Box>
				<Text color="white"> • Extension Secret: </Text>
				<Text color="green">Auto-generated ✓</Text>
			</Box>
			<Box>
				<Text color="white"> • Context: </Text>
				<Text color="green">{config.extensionContext} ✓</Text>
			</Box>
			<Box>
				<Text color="white"> • Scopes: </Text>
				<Text color="green">Empty (as requested) ✓</Text>
			</Box>

			<Box marginTop={1}>
				<Text>
					━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="white" bold>
					📁 Your project is ready at:{" "}
				</Text>
				<Text color="white">
					{process.cwd()}/{config.projectName}
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text>
					━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				</Text>
			</Box>
		</Box>
	);
};
