import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";

interface ProjectModeSelectorProps {
	onSelect: (mode: "new" | "existing") => void;
}

export const ProjectModeSelector: React.FC<ProjectModeSelectorProps> = ({
	onSelect,
}) => {
	const modeItems = [
		{ label: "Start new project", value: "new" },
		{ label: "Continue with existing boilerplate", value: "existing" },
	];

	const handleModeSelect = (item: { value: string }) => {
		if (item.value === "existing") {
			// Handle existing project flow
			console.log(
				"\n📁 Please navigate to your existing project directory and continue from there.",
			);
			process.exit(0);
		} else {
			onSelect(item.value as "new" | "existing");
		}
	};

	return (
		<Box flexDirection="column">
			<Text>
				Are you starting a new project or continuing with an existing
				boilerplate?
			</Text>
			<Box marginTop={1}>
				<SelectInput items={modeItems} onSelect={handleModeSelect} />
			</Box>
		</Box>
	);
};
