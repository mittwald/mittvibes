import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";
import { useEffect, useState } from "react";
import {
	getCustomers,
	getProjectsByCustomer,
	installExtension,
} from "../../api/mittwald.js";

interface InstallationSetupProps {
	extensionId: string;
	extensionContext: "customer" | "project";
	selectedCustomerId?: string;
	onComplete: (installData: {
		installedInContext?: string;
		installedInCustomer?: string;
		installedInProject?: string;
	}) => void;
}

interface Customer {
	customerId: string;
	name: string;
}

interface Project {
	id: string;
	description: string;
}

export const InstallationSetup: React.FC<InstallationSetupProps> = ({
	extensionId,
	extensionContext,
	selectedCustomerId,
	onComplete,
}) => {
	const [step, setStep] = useState<
		"confirm" | "selectCustomer" | "selectProject" | "installing" | "done"
	>("confirm");
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedInstallCustomer, setSelectedInstallCustomer] = useState<
		string | undefined
	>(selectedCustomerId);
	const [selectedProject, setSelectedProject] = useState<string | undefined>();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (step === "selectCustomer") {
			const fetchCustomers = async () => {
				try {
					const customerList = await getCustomers();
					setCustomers(customerList);
				} catch (err) {
					setError(
						err instanceof Error ? err.message : "Failed to load organizations",
					);
				}
			};
			fetchCustomers();
		}
	}, [step]);

	useEffect(() => {
		if (step === "selectProject" && selectedInstallCustomer) {
			const fetchProjects = async () => {
				try {
					const projectList = await getProjectsByCustomer(
						selectedInstallCustomer,
					);
					setProjects(projectList);
				} catch (err) {
					setError(
						err instanceof Error ? err.message : "Failed to load projects",
					);
				}
			};
			fetchProjects();
		}
	}, [step, selectedInstallCustomer]);

	useEffect(() => {
		if (step === "installing") {
			const install = async () => {
				try {
					if (extensionContext === "customer" && selectedInstallCustomer) {
						await installExtension({
							extensionId,
							customerId: selectedInstallCustomer,
						});
						onComplete({
							installedInContext: "customer",
							installedInCustomer: selectedInstallCustomer,
						});
					} else if (
						extensionContext === "project" &&
						selectedProject &&
						selectedInstallCustomer
					) {
						await installExtension({
							extensionId,
							projectId: selectedProject,
						});
						onComplete({
							installedInContext: "project",
							installedInProject: selectedProject,
							installedInCustomer: selectedInstallCustomer,
						});
					} else {
						setError("Invalid installation configuration");
						return;
					}
					setStep("done");
				} catch (err) {
					setError(
						err instanceof Error ? err.message : "Failed to install extension",
					);
				}
			};
			install();
		}
	}, [
		step,
		extensionId,
		extensionContext,
		selectedInstallCustomer,
		selectedProject,
		onComplete,
	]);

	if (error) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: {error}</Text>
			</Box>
		);
	}

	if (step === "confirm") {
		const confirmItems = [
			{
				label: "Yes, install the extension now",
				value: "yes",
			},
			{
				label: "No, I'll install it manually later",
				value: "no",
			},
		];

		return (
			<Box flexDirection="column">
				<Text color="white" bold>
					Install Extension
				</Text>
				<Box marginTop={1}>
					<Text color="white">
						Would you like to install this extension in a{" "}
						{extensionContext === "customer" ? "organization" : "project"} now?
					</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={confirmItems}
						onSelect={(item) => {
							if (item.value === "yes") {
								if (extensionContext === "customer") {
									setStep("selectCustomer");
								} else {
									setStep("selectCustomer"); // Need customer first, then project
								}
							} else {
								onComplete({});
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === "selectCustomer") {
		if (customers.length === 0) {
			return (
				<Box flexDirection="column">
					<Text color="white">Loading organizations...</Text>
				</Box>
			);
		}

		const customerItems = customers.map((customer) => ({
			label: customer.name,
			value: customer.customerId,
		}));

		return (
			<Box flexDirection="column">
				<Text color="white" bold>
					Select Organization
				</Text>
				<Box marginTop={1}>
					<Text color="white">
						{extensionContext === "customer"
							? "Which organization should this extension be installed in?"
							: "Which organization contains the project?"}
					</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={customerItems}
						onSelect={(item) => {
							setSelectedInstallCustomer(item.value);
							if (extensionContext === "customer") {
								setStep("installing");
							} else {
								setStep("selectProject");
							}
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === "selectProject") {
		if (projects.length === 0) {
			return (
				<Box flexDirection="column">
					<Text color="white">Loading projects...</Text>
				</Box>
			);
		}

		// Find customer name for display
		const customerName =
			customers.find((c) => c.customerId === selectedInstallCustomer)?.name ||
			"Selected Organization";

		const projectItems = projects.map((project) => ({
			label: `${project.description || project.id}`,
			value: project.id,
		}));

		return (
			<Box flexDirection="column">
				<Text color="white" bold>
					Select Project
				</Text>
				<Box marginTop={1}>
					<Text color="white">Projects in {customerName}:</Text>
				</Box>
				<Box marginTop={1}>
					<Text color="white">
						Which project should this extension be installed in?
					</Text>
				</Box>
				<Box marginTop={1}>
					<SelectInput
						items={projectItems}
						onSelect={(item) => {
							setSelectedProject(item.value);
							setStep("installing");
						}}
					/>
				</Box>
			</Box>
		);
	}

	if (step === "installing") {
		return (
			<Box flexDirection="column">
				<Text color="white">Installing extension...</Text>
			</Box>
		);
	}

	if (step === "done") {
		return (
			<Box flexDirection="column">
				<Text color="green">✓ Extension installed successfully!</Text>
			</Box>
		);
	}

	return null;
};
