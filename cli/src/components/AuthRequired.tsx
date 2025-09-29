import { Box, Text } from "ink";
import type React from "react";

export const AuthRequired: React.FC = () => {
	return (
		<Box flexDirection="column" marginTop={1}>
			<Text color="white" bold>
				🔐 Authentication Required
			</Text>
			<Box marginTop={1}>
				<Text color="white">
					You must authenticate before creating projects.
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="white">Please run:</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="white" bold>
					mittvibes auth:login
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">
					After authentication, you can run 'mittvibes' to create your project.
				</Text>
			</Box>
		</Box>
	);
};
