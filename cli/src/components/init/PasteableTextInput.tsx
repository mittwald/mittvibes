import { Text, useInput } from "ink";
import type React from "react";
import { useState } from "react";

interface PasteableTextInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit?: () => void;
	placeholder?: string;
	mask?: string;
}

/**
 * Custom text input component that properly handles pasted content.
 *
 * This component uses Ink's useInput hook directly to work around paste truncation
 * issues in ink-text-input v6.0.0 where long strings (200+ characters) get truncated.
 *
 * See: https://github.com/vadimdemedes/ink-text-input/issues/90
 */
export const PasteableTextInput: React.FC<PasteableTextInputProps> = ({
	value,
	onChange,
	onSubmit,
	placeholder = "",
	mask,
}) => {
	const [, setRenderTrigger] = useState(0);

	useInput((input, key) => {
		if (key.return) {
			onSubmit?.();
		} else if (key.backspace || key.delete) {
			if (value.length > 0) {
				onChange(value.slice(0, -1));
			}
		} else if (key.ctrl && input === "u") {
			// Ctrl+U: Clear entire line
			onChange("");
		} else if (key.ctrl && input === "w") {
			// Ctrl+W: Delete word
			const lastSpaceIndex = value.trimEnd().lastIndexOf(" ");
			if (lastSpaceIndex === -1) {
				onChange("");
			} else {
				onChange(value.slice(0, lastSpaceIndex + 1));
			}
		} else if (input) {
			onChange(value + input);
			setRenderTrigger((prev) => prev + 1);
		}
	});

	// Display the value or placeholder
	const displayValue = value || placeholder;
	const displayColor = value ? undefined : "gray";

	// Apply mask if specified
	const maskedValue = mask && value ? mask.repeat(value.length) : displayValue;

	return <Text color={displayColor}>{maskedValue}</Text>;
};
