import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type React from "react";
import { useEffect, useState } from "react";
import {
	getCustomersWithContributorStatus,
	submitContributorInterest,
} from "../../api/mittwald.js";

interface CustomerWithContributorStatus {
	customerId: string;
	name: string;
	description?: string;
	isContributor: boolean;
}

interface OrganizationSelectorProps {
	onSelect: (data: {
		selectedCustomerId: string;
		isContributor: boolean;
	}) => void;
}

type SelectorState =
	| "loading"
	| "selectingOrg"
	| "noOrgs"
	| "nonContributor"
	| "submittingInterest"
	| "interestSubmitted"
	| "error";

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
	onSelect,
}) => {
	const [state, setState] = useState<SelectorState>("loading");
	const [customers, setCustomers] = useState<CustomerWithContributorStatus[]>(
		[],
	);
	const [selectedCustomer, setSelectedCustomer] =
		useState<CustomerWithContributorStatus | null>(null);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const loadOrganizations = async () => {
			try {
				setState("loading");
				const customerList = await getCustomersWithContributorStatus();

				if (customerList.length === 0) {
					setState("noOrgs");
					return;
				}

				setCustomers(customerList);
				setState("selectingOrg");
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
				setState("error");
			}
		};

		loadOrganizations();
	}, []);

	const handleOrganizationSelect = (item: { value: string }) => {
		const customer = customers.find((c) => c.customerId === item.value);
		if (!customer) return;

		setSelectedCustomer(customer);

		if (customer.isContributor) {
			onSelect({
				selectedCustomerId: customer.customerId,
				isContributor: true,
			});
		} else {
			setState("nonContributor");
		}
	};

	const handleNonContributorAction = (item: { value: string }) => {
		switch (item.value) {
			case "submit_interest":
				setState("submittingInterest");
				submitInterest();
				break;
			case "select_different":
				setState("selectingOrg");
				setSelectedCustomer(null);
				break;
			case "exit":
				process.exit(0);
				break;
		}
	};

	const submitInterest = async () => {
		if (!selectedCustomer) return;

		try {
			await submitContributorInterest(selectedCustomer.customerId);
			setState("interestSubmitted");
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
			setState("error");
		}
	};

	const renderContent = () => {
		switch (state) {
			case "loading":
				return (
					<Box>
						<Text color="yellow">🔄 Fetching your organizations...</Text>
					</Box>
				);

			case "noOrgs":
				return (
					<Box flexDirection="column">
						<Text color="red" bold>
							❌ No Organizations Found
						</Text>
						<Box marginTop={1}>
							<Text>You don't have access to any organizations.</Text>
						</Box>
						<Box marginTop={1}>
							<Text color="gray">
								Please make sure you have the correct permissions.
							</Text>
						</Box>
					</Box>
				);

			case "selectingOrg": {
				const orgItems = customers.map((customer) => ({
					label: `${customer.name} ${customer.isContributor ? "(✓ Contributor)" : "(Not a contributor)"}`,
					value: customer.customerId,
				}));

				return (
					<Box flexDirection="column">
						<Text color="white" bold>
							🏢 Select Organization
						</Text>
						<Box marginTop={1}>
							<Text>Which organization would you like to use?</Text>
						</Box>
						<Box marginTop={1}>
							<SelectInput
								items={orgItems}
								onSelect={handleOrganizationSelect}
							/>
						</Box>
					</Box>
				);
			}

			case "nonContributor": {
				const actionItems = [
					{
						label: "Submit interest to become a contributor",
						value: "submit_interest",
					},
					{
						label: "Select a different organization",
						value: "select_different",
					},
					{ label: "Exit and apply manually", value: "exit" },
				];

				return (
					<Box flexDirection="column">
						<Text color="yellow">
							⚠️ This organization is not yet a contributor
						</Text>
						<Box marginTop={1}>
							<Text>Organization: {selectedCustomer?.name}</Text>
						</Box>
						<Box marginTop={1}>
							<Text color="gray">
								To create mittwald extensions, the organization needs
								contributor status.
							</Text>
						</Box>
						<Box marginTop={1}>
							<Text>What would you like to do?</Text>
						</Box>
						<Box marginTop={1}>
							<SelectInput
								items={actionItems}
								onSelect={handleNonContributorAction}
							/>
						</Box>
					</Box>
				);
			}

			case "submittingInterest":
				return (
					<Box flexDirection="column">
						<Text color="yellow">🔄 Submitting contributor interest...</Text>
						<Box marginTop={1}>
							<Text>Organization: {selectedCustomer?.name}</Text>
						</Box>
					</Box>
				);

			case "interestSubmitted": {
				const nextActionItems = [
					{
						label:
							"Select a different organization (if you have contributor access)",
						value: "select_different",
					},
					{ label: "Exit and wait for approval", value: "exit" },
				];

				return (
					<Box flexDirection="column">
						<Text color="green">✓ Interest Submitted</Text>
						<Box marginTop={1}>
							<Text>
								Your interest to become a contributor has been submitted.
							</Text>
						</Box>
						<Box marginTop={1}>
							<Text color="gray">
								You will be notified when your application is reviewed.
							</Text>
						</Box>
						<Box marginTop={1}>
							<Text>What would you like to do now?</Text>
						</Box>
						<Box marginTop={1}>
							<SelectInput
								items={nextActionItems}
								onSelect={handleNonContributorAction}
							/>
						</Box>
					</Box>
				);
			}

			case "error":
				return (
					<Box flexDirection="column">
						<Text color="red">❌ Error: {error}</Text>
						<Box marginTop={1}>
							<Text color="gray">
								Please try again or check your network connection.
							</Text>
						</Box>
					</Box>
				);

			default:
				return <Text>Unknown state</Text>;
		}
	};

	return (
		<Box flexDirection="column">
			<Text color="white" bold>
				🎯 Organization Setup
			</Text>
			<Box marginTop={1}>
				<Text>
					First, let's select which organization you want to create an extension
					for.
				</Text>
			</Box>
			<Box marginTop={1}>{renderContent()}</Box>
		</Box>
	);
};
