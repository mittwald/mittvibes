import { Box, Text } from "ink";
import type React from "react";
import { useState } from "react";
import { CompletionScreen } from "./init/CompletionScreen.js";
import { ContextSelector } from "./init/ContextSelector.js";
import { DatabaseSetup } from "./init/DatabaseSetup.js";
import { DependencyInstaller } from "./init/DependencyInstaller.js";
import { ExtensionSetup } from "./init/ExtensionSetup.js";
import { GitHubActionSetup } from "./init/GitHubActionSetup.js";
import { InstallationSetup } from "./init/InstallationSetup.js";
import { OrganizationSelector } from "./init/OrganizationSelector.js";
import { ProjectCreator } from "./init/ProjectCreator.js";
import { ProjectNameInput } from "./init/ProjectNameInput.js";

export interface ProjectConfig {
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
	extensionName?: string;
	frontendUrl?: string;
	webhookUrl?: string;
	installedInContext?: string;
	installedInCustomer?: string;
	installedInProject?: string;
	enableGitHubAction: boolean;
}

const STEP_ORDER = [
	"organization",
	"context",
	"projectName",
	"githubAction",
	"creating",
	"dependencies",
	"database",
	"extension",
	"installation",
	"completed",
] as const;

type InitStep = (typeof STEP_ORDER)[number];

export const InitCommand: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<InitStep>("organization");
	const [config, setConfig] = useState<Partial<ProjectConfig>>({});

	const updateConfig = (updates: Partial<ProjectConfig>) => {
		setConfig((prev) => ({ ...prev, ...updates }));
	};

	const nextStep = () => {
		const currentIndex = STEP_ORDER.indexOf(currentStep);
		const nextIndex = currentIndex + 1;
		if (nextIndex < STEP_ORDER.length) {
			setCurrentStep(STEP_ORDER[nextIndex]);
		}
	};

	const completeStep = (updates?: Partial<ProjectConfig>) => {
		if (updates) {
			updateConfig(updates);
		}
		nextStep();
	};

	const renderCurrentStep = () => {
		switch (currentStep) {
			case "organization":
				return <OrganizationSelector onSelect={completeStep} />;

			case "context":
				return <ContextSelector onSelect={completeStep} />;

			case "projectName":
				return (
					<ProjectNameInput
						onSubmit={(projectName) => completeStep({ projectName })}
					/>
				);

			case "githubAction":
				return (
					<GitHubActionSetup
						onComplete={(enableGitHubAction) =>
							completeStep({ enableGitHubAction })
						}
					/>
				);

			case "creating":
				if (!config.projectName || config.enableGitHubAction === undefined) {
					return <Text color="red">Error: Required configuration missing</Text>;
				}
				return (
					<ProjectCreator
						projectName={config.projectName}
						enableGitHubAction={config.enableGitHubAction}
						onComplete={(actualFolderName) =>
							completeStep({ projectName: actualFolderName })
						}
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
						onComplete={(installDeps) => completeStep({ installDeps })}
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
						onComplete={completeStep}
					/>
				);

			case "extension":
				if (
					!config.projectName ||
					!config.extensionContext ||
					!config.selectedCustomerId
				) {
					return <Text color="red">Error: Required configuration missing</Text>;
				}
				return (
					<ExtensionSetup
						projectName={config.projectName}
						extensionContext={config.extensionContext}
						selectedCustomerId={config.selectedCustomerId}
						onComplete={completeStep}
					/>
				);

			case "installation":
				if (!config.extensionId || !config.extensionContext) {
					return <Text color="red">Error: Extension not configured</Text>;
				}
				return (
					<InstallationSetup
						extensionId={config.extensionId}
						extensionContext={config.extensionContext}
						selectedCustomerId={config.selectedCustomerId}
						onComplete={completeStep}
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
