import { Box, Text } from "ink";
import type React from "react";
import { useEffect, useState } from "react";
import { clearAuthConfig } from "../utils/config.js";

export const LogoutCommand: React.FC = () => {
	const [status, setStatus] = useState<"processing" | "success" | "error">(
		"processing",
	);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const performLogout = async () => {
			try {
				await clearAuthConfig();
				setStatus("success");
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
				setStatus("error");
			}
		};

		performLogout();
	}, []);

	if (status === "processing") {
		return (
			<Box>
				<Text color="yellow">🔄 Logging out...</Text>
			</Box>
		);
	}

	if (status === "success") {
		return (
			<Box flexDirection="column">
				<Text color="green">✅ Successfully logged out</Text>
				<Box marginTop={1}>
					<Text color="gray">
						Your authentication tokens have been removed.
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === "error") {
		return (
			<Box flexDirection="column">
				<Text color="red">❌ Failed to logout</Text>
				<Box marginTop={1}>
					<Text color="red">Error: {error}</Text>
				</Box>
			</Box>
		);
	}

	return null;
};
