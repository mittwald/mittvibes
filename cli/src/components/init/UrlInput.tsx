import { Box, Text } from "ink";
import type React from "react";
import { PasteableTextInput } from "./PasteableTextInput.js";

interface UrlInputProps {
	prompt: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	placeholder: string;
}

export const UrlInput: React.FC<UrlInputProps> = ({
	prompt,
	label,
	value,
	onChange,
	onSubmit,
	placeholder,
}) => {
	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				🎯 Extension Development Setup
			</Text>

			<Box marginTop={1}>
				<Text>{prompt}</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">{label} (optional, press Enter to skip):</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">URL: </Text>
				<PasteableTextInput
					value={value}
					onChange={onChange}
					onSubmit={onSubmit}
					placeholder={placeholder}
				/>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">Leave empty to configure later in mStudio...</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="yellow">
					You can update this anytime in mStudio after deployment
				</Text>
			</Box>
		</Box>
	);
};
