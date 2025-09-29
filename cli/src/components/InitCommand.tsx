import { Box, Text } from "ink";
import type React from "react";
import { useState } from "react";
import { CompletionScreen } from "./init/CompletionScreen.js";
import { ContextSelector } from "./init/ContextSelector.js";
import { DatabaseSetup } from "./init/DatabaseSetup.js";
import { DependencyInstaller } from "./init/DependencyInstaller.js";
import { ExtensionSetup } from "./init/ExtensionSetup.js";
import { OrganizationSelector } from "./init/OrganizationSelector.js";
import { ProjectCreator } from "./init/ProjectCreator.js";
import { ProjectModeSelector } from "./init/ProjectModeSelector.js";
import { ProjectNameInput } from "./init/ProjectNameInput.js";

export interface ProjectConfig {
	mode: "new" | "existing";
	projectName: string;
	installDeps: boolean;
	setupDatabase: boolean;
	databaseUrl?: string;
	runMigration: boolean;
	isContributor: boolean;
	extensionContext: "customer" | "project";
	selectedContextId?: string;
	selectedCustomerId?: string;
	extensionId?: string;
	extensionSecret?: string;
}

type InitStep =
	| "organization"
	| "context"
	| "mode"
	| "projectName"
	| "creating"
	| "dependencies"
	| "database"
	| "extension"
	| "completed";

export const InitCommand: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<InitStep>("organization");
	const [config, setConfig] = useState<Partial<ProjectConfig>>({});

	const updateConfig = (updates: Partial<ProjectConfig>) => {
		setConfig((prev) => ({ ...prev, ...updates }));
	};

	const nextStep = () => {
		switch (currentStep) {
			case "organization":
				setCurrentStep("context");
				break;
			case "context":
				setCurrentStep("mode");
				break;
			case "mode":
				if (config.mode === "existing") {
					setCurrentStep("completed");
				} else {
					setCurrentStep("projectName");
				}
				break;
			case "projectName":
				setCurrentStep("creating");
				break;
			case "creating":
				setCurrentStep("dependencies");
				break;
			case "dependencies":
				setCurrentStep("database");
				break;
			case "database":
				setCurrentStep("extension");
				break;
			case "extension":
				setCurrentStep("completed");
				break;
		}
	};

	const renderCurrentStep = () => {
		switch (currentStep) {
			case "organization":
				return (
					<OrganizationSelector
						onSelect={(data) => {
							updateConfig({
								selectedCustomerId: data.selectedCustomerId,
								isContributor: data.isContributor,
							});
							nextStep();
						}}
					/>
				);

			case "context":
				return (
					<ContextSelector
						onSelect={(data) => {
							updateConfig({
								extensionContext: data.extensionContext,
								selectedContextId: data.selectedContextId,
							});
							nextStep();
						}}
					/>
				);

			case "mode":
				return (
					<ProjectModeSelector
						onSelect={(mode) => {
							updateConfig({ mode });
							nextStep();
						}}
					/>
				);

			case "projectName":
				return (
					<ProjectNameInput
						onSubmit={(projectName) => {
							updateConfig({ projectName });
							nextStep();
						}}
					/>
				);

			case "creating":
				if (!config.projectName) {
					return <Text color="red">Error: Project name not configured</Text>;
				}
				return (
					<ProjectCreator
						projectName={config.projectName}
						onComplete={() => nextStep()}
						onError={(error) => {
							console.error("Project creation failed:", error);
							process.exit(1);
						}}
					/>
				);

			case "dependencies":
				if (!config.projectName) {
					return <Text color="red">Error: Project name not configured</Text>;
				}
				return (
					<DependencyInstaller
						projectName={config.projectName}
						onComplete={(installDeps) => {
							updateConfig({ installDeps });
							nextStep();
						}}
					/>
				);

			case "database":
				if (
					!config.projectName ||
					!config.selectedCustomerId ||
					!config.extensionContext ||
					!config.selectedContextId ||
					config.installDeps === undefined
				) {
					return <Text color="red">Error: Required configuration missing</Text>;
				}
				return (
					<DatabaseSetup
						projectName={config.projectName}
						selectedCustomerId={config.selectedCustomerId}
						extensionContext={config.extensionContext}
						selectedContextId={config.selectedContextId}
						installDeps={config.installDeps}
						onComplete={(databaseConfig) => {
							updateConfig(databaseConfig);
							nextStep();
						}}
					/>
				);

			case "extension":
				if (!config.projectName || !config.extensionContext) {
					return <Text color="red">Error: Required configuration missing</Text>;
				}
				return (
					<ExtensionSetup
						projectName={config.projectName}
						extensionContext={config.extensionContext}
						onComplete={(extensionConfig) => {
							updateConfig(extensionConfig);
							nextStep();
						}}
					/>
				);

			case "completed":
				return <CompletionScreen config={config as ProjectConfig} />;

			default:
				return <Text>Unknown step</Text>;
		}
	};

	return (
		<Box flexDirection="column" marginTop={1}>
			{renderCurrentStep()}
		</Box>
	);
};
