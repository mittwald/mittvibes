import { Box, Text } from "ink";
import type React from "react";
import { useEffect, useState } from "react";
import { getAuthConfig, isAuthenticated } from "../utils/config.js";

export const StatusCommand: React.FC = () => {
	const [status, setStatus] = useState<
		"loading" | "authenticated" | "notAuthenticated"
	>("loading");
	const [userInfo, setUserInfo] = useState<{
		userId?: string;
		organizationId?: string;
	}>({});

	useEffect(() => {
		const checkStatus = async () => {
			try {
				if (await isAuthenticated()) {
					const auth = await getAuthConfig();
					setUserInfo({
						userId: auth?.userId,
						organizationId: auth?.organizationId,
					});
					setStatus("authenticated");
				} else {
					setStatus("notAuthenticated");
				}
			} catch (_error) {
				setStatus("notAuthenticated");
			}
		};

		checkStatus();
	}, []);

	if (status === "loading") {
		return (
			<Box>
				<Text>Checking authentication status...</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				🔐 Authentication Status
			</Text>

			{status === "authenticated" ? (
				<Box flexDirection="column" marginTop={1}>
					<Text color="green">✓ Authenticated</Text>
					{userInfo.userId && (
						<Box marginTop={1}>
							<Text color="gray"> User ID: {userInfo.userId}</Text>
						</Box>
					)}
					{userInfo.organizationId && (
						<Box>
							<Text color="gray"> Organization: {userInfo.organizationId}</Text>
						</Box>
					)}
				</Box>
			) : (
				<Box flexDirection="column" marginTop={1}>
					<Text color="red">✗ Not authenticated</Text>
					<Box marginTop={1}>
						<Text color="gray">Run 'mittvibes auth:login' to authenticate</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
};
