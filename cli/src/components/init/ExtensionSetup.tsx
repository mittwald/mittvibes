import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";

interface ExtensionSetupProps {
	projectName: string;
	extensionContext: "customer" | "project";
	onComplete: (config: { extensionId: string }) => void;
}

export const ExtensionSetup: React.FC<ExtensionSetupProps> = ({
	extensionContext,
	onComplete,
}) => {
	const [extensionId, setExtensionId] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const anchorUrl =
		extensionContext === "customer"
			? "/customers/customer/menu/section/extensions/item"
			: "/projects/project/menu/section/extensions/item";

	const handleSubmit = () => {
		if (extensionId.trim().length > 0) {
			setSubmitted(true);
			onComplete({ extensionId: extensionId.trim() });
		}
	};

	if (submitted) {
		return (
			<Box flexDirection="column">
				<Text color="green">✅ Extension configuration saved!</Text>
				<Box marginTop={1}>
					<Text>Your extension setup is complete.</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				🎯 Extension Development Setup
			</Text>

			<Box marginTop={1}>
				<Text color="white" bold>
					Required Manual Steps:
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="white">
					1. Create Extension in mStudio Contributor UI:
				</Text>
			</Box>
			<Box>
				<Text color="gray">
					{" "}
					• Navigate to "Entwicklung" in your organization
				</Text>
			</Box>
			<Box>
				<Text color="gray">
					{" "}
					• Create a new extension and copy the EXTENSION_ID
				</Text>
			</Box>
			<Box>
				<Text color="gray"> • Set extension context to: </Text>
				<Text bold>{extensionContext}</Text>
			</Box>
			<Box>
				<Text color="gray"> • Set anchor URL to: </Text>
				<Text bold>{anchorUrl}</Text>
			</Box>
			<Box>
				<Text color="gray"> • Leave scopes empty for now</Text>
			</Box>
			<Box>
				<Text color="gray"> • Set webhook URL to your public endpoint</Text>
			</Box>

			<Box marginTop={2}>
				<Text>Enter your EXTENSION_ID (from mStudio):</Text>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">ID: </Text>
				<TextInput
					value={extensionId}
					onChange={setExtensionId}
					onSubmit={handleSubmit}
				/>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">Press Enter to continue...</Text>
			</Box>
		</Box>
	);
};
