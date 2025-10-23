import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";

interface ProjectNameInputProps {
	onSubmit: (projectName: string) => void;
}

export const ProjectNameInput: React.FC<ProjectNameInputProps> = ({
	onSubmit,
}) => {
	const [projectName, setProjectName] = useState("my-mittwald-extension");
	const [error, setError] = useState<string>("");

	const validateProjectName = (name: string): boolean => {
		if (/^[a-z0-9-]+$/.test(name)) {
			return true;
		}
		setError(
			"Project name can only contain lowercase letters, numbers, and hyphens",
		);
		return false;
	};

	const handleSubmit = () => {
		if (validateProjectName(projectName)) {
			setError("");
			onSubmit(projectName);
		}
	};

	return (
		<Box flexDirection="column">
			<Text>What is the name of your extension?</Text>
			<Box marginTop={1}>
				<Text color="gray">Name: </Text>
				<TextInput
					value={projectName}
					onChange={setProjectName}
					onSubmit={handleSubmit}
				/>
			</Box>
			{error && (
				<Box marginTop={1}>
					<Text color="red">{error}</Text>
				</Box>
			)}
			<Box marginTop={1}>
				<Text color="gray">Press Enter to continue...</Text>
			</Box>
		</Box>
	);
};
