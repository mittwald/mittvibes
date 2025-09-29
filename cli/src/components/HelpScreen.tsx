import { Box, Text } from "ink";
import type React from "react";
import { WelcomeScreen } from "./WelcomeScreen.js";

export const HelpScreen: React.FC = () => {
	return (
		<Box flexDirection="column">
			<WelcomeScreen />
			<Box marginTop={1}>
				<Text color="white" bold>
					CLI tool to generate boilerplate for mittwald extensions
				</Text>
			</Box>

			<Box marginTop={1}>
				<Text bold>Usage:</Text>
			</Box>
			<Box>
				<Text color="white"> mittvibes [command]</Text>
			</Box>

			<Box marginTop={1}>
				<Text bold>Commands:</Text>
			</Box>
			<Box>
				<Text color="white"> init </Text>
				<Text color="gray">
					Initialize a new mittwald extension project (default)
				</Text>
			</Box>
			<Box>
				<Text color="white"> auth:login </Text>
				<Text color="gray">Authenticate with mittwald OAuth</Text>
			</Box>
			<Box>
				<Text color="white"> auth:logout </Text>
				<Text color="gray">Clear authentication tokens</Text>
			</Box>
			<Box>
				<Text color="white"> auth:status </Text>
				<Text color="gray">Check authentication status</Text>
			</Box>
			<Box>
				<Text color="white"> help </Text>
				<Text color="gray">Show this help message</Text>
			</Box>

			<Box marginTop={1}>
				<Text bold>Examples:</Text>
			</Box>
			<Box>
				<Text color="gray"> # Authenticate with mittwald</Text>
			</Box>
			<Box>
				<Text color="white"> mittvibes auth:login</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray"> # Create a new extension project</Text>
			</Box>
			<Box>
				<Text color="white"> mittvibes</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray"> # Check authentication status</Text>
			</Box>
			<Box>
				<Text color="white"> mittvibes auth:status</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray"> # Show help</Text>
			</Box>
			<Box>
				<Text color="white"> mittvibes help</Text>
			</Box>

			<Box marginTop={1}>
				<Text bold>Notes:</Text>
			</Box>
			<Box>
				<Text color="gray">
					{" "}
					• Authentication is required before creating projects
				</Text>
			</Box>
			<Box>
				<Text color="gray">
					{" "}
					• OAuth callback uses port 52847 (must be available)
				</Text>
			</Box>
			<Box>
				<Text color="gray">
					{" "}
					• Configuration is stored in ~/.mittvibes/config.json
				</Text>
			</Box>
		</Box>
	);
};
