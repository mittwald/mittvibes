import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";
import { useState } from "react";
import { getProjects } from "../../api/mittwald.js";

interface ContextSelectorProps {
	onSelect: (data: {
		extensionContext: "customer" | "project";
		selectedContextId: string;
	}) => void;
}

type ContextState =
	| "selectingContext"
	| "selectingProject"
	| "loadingProjects"
	| "error";

export const ContextSelector: React.FC<ContextSelectorProps> = ({
	onSelect,
}) => {
	const [state, setState] = useState<ContextState>("selectingContext");
	const [, setExtensionContext] = useState<"customer" | "project">("customer");
	const [projects, setProjects] = useState<
		Array<{ id: string; description: string }>
	>([]);
	const [error, setError] = useState<string>("");

	const contextItems = [
		{
			label: "Organization Level - Available in organization menu",
			value: "customer",
		},
		{
			label: "Project Level - Available in individual project menus",
			value: "project",
		},
	];

	const handleContextSelect = async (item: { value: string }) => {
		const context = item.value as "customer" | "project";
		setExtensionContext(context);

		if (context === "customer") {
			onSelect({
				extensionContext: context,
				selectedContextId: "customer-id",
			});
		} else {
			setState("loadingProjects");
			try {
				const projectList = await getProjects();
				if (projectList.length === 0) {
					setError(
						"No projects found. You need at least one project to create a project-level extension.",
					);
					setState("error");
					return;
				}
				setProjects(projectList);
				setState("selectingProject");
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
				setState("error");
			}
		}
	};

	const handleProjectSelect = (item: { value: string }) => {
		onSelect({
			extensionContext: "project",
			selectedContextId: item.value,
		});
	};

	const renderContent = () => {
		switch (state) {
			case "selectingContext":
				return (
					<Box flexDirection="column">
						<Text>
							Choose the context where your extension will be available:
						</Text>
						<Box marginTop={1}>
							<Text color="gray">
								(You may change this later during development)
							</Text>
						</Box>
						<Box marginTop={1}>
							<SelectInput
								items={contextItems}
								onSelect={handleContextSelect}
							/>
						</Box>
					</Box>
				);

			case "loadingProjects":
				return (
					<Box>
						<Text color="yellow">🔄 Loading your projects...</Text>
					</Box>
				);

			case "selectingProject": {
				const projectItems = projects.map((project) => ({
					label: `${project.description} (${project.id})`,
					value: project.id,
				}));

				return (
					<Box flexDirection="column">
						<Text color="white" bold>
							📂 Project Selection
						</Text>
						<Box marginTop={1}>
							<Text>Select the project for testing your extension:</Text>
						</Box>
						<Box marginTop={1}>
							<SelectInput
								items={projectItems}
								onSelect={handleProjectSelect}
							/>
						</Box>
					</Box>
				);
			}

			case "error":
				return (
					<Box flexDirection="column">
						<Text color="red">❌ Error: {error}</Text>
						<Box marginTop={1}>
							<Text color="gray">Please try again or check your setup.</Text>
						</Box>
					</Box>
				);

			default:
				return <Text>Unknown state</Text>;
		}
	};

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				📍 Extension Context Selection
			</Text>
			<Box marginTop={1}>{renderContent()}</Box>
		</Box>
	);
};
