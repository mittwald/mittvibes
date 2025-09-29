import { Box, Text } from "ink";
import type React from "react";
import { useEffect, useState } from "react";

interface ProjectCreatorProps {
	projectName: string;
	onComplete: () => void;
	onError: (error: string) => void;
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
			// Simulate the project creation process
			setStatus("downloading");
			await new Promise((resolve) => setTimeout(resolve, 2000));

			setStatus("extracting");
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setStatus("updating");
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setStatus("completed");
			onComplete();
		};

		createProject().catch((error) => {
			onError(error instanceof Error ? error.message : String(error));
		});
	}, [onComplete, onError]);

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
