import { Box, Text, useInput } from "ink";
import type React from "react";
import { useEffect, useState } from "react";
import type { OAuthFlowResult } from "../auth/oauth.js";
import { startOAuthFlow } from "../auth/oauth.js";
import { getAuthConfig, isAuthenticated } from "../utils/config.js";

interface LoginCommandProps {
	onComplete?: () => void;
}

export const LoginCommand: React.FC<LoginCommandProps> = ({ onComplete }) => {
	const [status, setStatus] = useState<
		| "checking"
		| "alreadyAuth"
		| "needsAuth"
		| "showingUrl"
		| "authenticating"
		| "success"
		| "error"
	>("checking");
	const [error, setError] = useState<string>("");
	const [userInfo, setUserInfo] = useState<{
		userId?: string;
		organizationId?: string;
	}>({});
	const [oauthFlow, setOauthFlow] = useState<OAuthFlowResult | null>(null);

	// Handle user input when showing URL
	useInput(
		(input, key) => {
			if (status === "showingUrl" && (key.return || input === " ")) {
				if (oauthFlow) {
					setStatus("authenticating");
					// Open browser and wait for completion
					oauthFlow
						.openBrowser()
						.then(() => oauthFlow.waitForCompletion())
						.then(() => {
							setStatus("success");
							if (onComplete) {
								setTimeout(onComplete, 2000);
							}
						})
						.catch((error) => {
							setError(error instanceof Error ? error.message : String(error));
							setStatus("error");
						});
				}
			}
		},
		{ isActive: status === "showingUrl" },
	);

	useEffect(() => {
		const checkAuthAndLogin = async () => {
			try {
				// Check if already authenticated
				if (await isAuthenticated()) {
					const auth = await getAuthConfig();
					setUserInfo({
						userId: auth?.userId,
						organizationId: auth?.organizationId,
					});
					setStatus("alreadyAuth");
					return;
				}

				setStatus("needsAuth");

				// Start authentication process after a brief delay
				setTimeout(async () => {
					try {
						const flow = await startOAuthFlow();
						setOauthFlow(flow);
						setStatus("showingUrl");
					} catch (error) {
						setError(error instanceof Error ? error.message : String(error));
						setStatus("error");
					}
				}, 1000);
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
				setStatus("error");
			}
		};

		checkAuthAndLogin();
	}, [onComplete]);

	if (status === "checking") {
		return (
			<Box>
				<Text>Checking authentication status...</Text>
			</Box>
		);
	}

	if (status === "alreadyAuth") {
		return (
			<Box flexDirection="column" marginTop={1}>
				<Text color="green">✓ You are already authenticated</Text>
				{userInfo.userId && (
					<Box marginTop={1}>
						<Text color="gray"> User ID: {userInfo.userId}</Text>
					</Box>
				)}
				<Box marginTop={1}>
					<Text color="gray">
						To re-authenticate, run: mittvibes auth:logout first
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === "needsAuth") {
		return (
			<Box flexDirection="column" marginTop={1}>
				<Text color="white" bold>
					🔐 mittwald Authentication
				</Text>
				<Box marginTop={1}>
					<Text color="white">
						This will open your browser to authenticate with mittwald.
					</Text>
				</Box>
				<Box marginTop={1}>
					<Text color="gray">
						Make sure port 52847 is available on your system.
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === "showingUrl") {
		return (
			<Box flexDirection="column" marginTop={1}>
				<Text color="white" bold>
					🔐 mittwald Authentication
				</Text>
				<Box marginTop={1}>
					<Text color="gray">Copy this URL to authenticate:</Text>
				</Box>
				<Box marginTop={1} marginBottom={1}>
					<Text color="cyan">{oauthFlow?.authUrl}</Text>
				</Box>
				<Box marginTop={1}>
					<Text color="gray">
						Press <Text bold>Enter</Text> or <Text bold>Space</Text> to open
						your browser
					</Text>
				</Box>
				<Box marginTop={1}>
					<Text color="gray" dimColor>
						Make sure port 52847 is available on your system.
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === "authenticating") {
		return (
			<Box flexDirection="column" marginTop={1}>
				<Text color="yellow">🔄 Opening browser for authentication...</Text>
				<Box marginTop={1}>
					<Text color="gray">
						Complete the authentication process in your browser.
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === "success") {
		return (
			<Box flexDirection="column" marginTop={1}>
				<Text color="green">✅ Authentication successful!</Text>
				<Box marginTop={1}>
					<Text color="white">
						You can now use mittvibes to create extension projects.
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === "error") {
		return (
			<Box flexDirection="column" marginTop={1}>
				<Text color="red">❌ Authentication failed: {error}</Text>
				<Box marginTop={1}>
					<Text color="gray">
						Please try again or check your network connection.
					</Text>
				</Box>
			</Box>
		);
	}

	return null;
};
