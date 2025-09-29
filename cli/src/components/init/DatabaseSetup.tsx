import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";

interface DatabaseSetupProps {
	projectName: string;
	selectedCustomerId: string;
	extensionContext: "customer" | "project";
	selectedContextId: string;
	installDeps: boolean;
	onComplete: (config: {
		setupDatabase: boolean;
		databaseUrl?: string;
		runMigration: boolean;
	}) => void;
}

type DatabaseState = "askSetup" | "enterUrl" | "askMigration" | "completed";

export const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onComplete }) => {
	const [state, setState] = useState<DatabaseState>("askSetup");
	const [databaseUrl, setDatabaseUrl] = useState("");

	const setupOptions = [
		{ label: "Yes, configure PostgreSQL database now", value: "yes" },
		{ label: "No, I will configure it later", value: "no" },
	];

	const migrationOptions = [
		{ label: "Yes, generate Prisma client and run migration", value: "yes" },
		{ label: "No, I will do it manually later", value: "no" },
	];

	const handleSetupChoice = (item: { value: string }) => {
		if (item.value === "no") {
			onComplete({ setupDatabase: false, runMigration: false });
		} else {
			setState("enterUrl");
		}
	};

	const handleUrlSubmit = () => {
		if (
			databaseUrl.startsWith("postgresql://") ||
			databaseUrl.startsWith("postgres://")
		) {
			setState("askMigration");
		}
	};

	const handleMigrationChoice = (item: { value: string }) => {
		onComplete({
			setupDatabase: true,
			databaseUrl,
			runMigration: item.value === "yes",
		});
	};

	const renderContent = () => {
		switch (state) {
			case "askSetup":
				return (
					<Box flexDirection="column">
						<Text>
							Would you like to configure the PostgreSQL database now?
						</Text>
						<Box marginTop={1}>
							<SelectInput items={setupOptions} onSelect={handleSetupChoice} />
						</Box>
					</Box>
				);

			case "enterUrl":
				return (
					<Box flexDirection="column">
						<Text>Enter your PostgreSQL connection URL (non-pooling):</Text>
						<Box marginTop={1}>
							<Text color="gray">URL: </Text>
							<TextInput
								value={databaseUrl}
								onChange={setDatabaseUrl}
								onSubmit={handleUrlSubmit}
								placeholder="postgresql://user:password@host:port/database"
							/>
						</Box>
						<Box marginTop={1}>
							<Text color="gray">
								Must start with postgresql:// or postgres://
							</Text>
						</Box>
					</Box>
				);

			case "askMigration":
				return (
					<Box flexDirection="column">
						<Text>
							Would you like to generate Prisma client and run the initial
							migration?
						</Text>
						<Box marginTop={1}>
							<SelectInput
								items={migrationOptions}
								onSelect={handleMigrationChoice}
							/>
						</Box>
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				🗄️ Database Configuration
			</Text>
			<Box marginTop={1}>{renderContent()}</Box>
		</Box>
	);
};
