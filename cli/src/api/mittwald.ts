import { assertStatus, MittwaldAPIV2Client } from "@mittwald/api-client";
import { clearAuthConfig, getAccessToken } from "../utils/config.js";

interface Customer {
	customerId: string;
	name: string;
	description?: string;
}

interface CustomerWithContributorStatus extends Customer {
	isContributor: boolean;
}

interface Project {
	id: string;
	description: string;
	createdAt: string;
}

interface ExtensionInstallData {
	extensionId: string;
	customerId?: string;
	projectId?: string;
}

let cachedClient: MittwaldAPIV2Client | null = null;

async function createAPIClient(): Promise<MittwaldAPIV2Client> {
	if (cachedClient) {
		return cachedClient;
	}

	const token = await getAccessToken();

	if (!token) {
		throw new Error(
			"Not authenticated. Please run 'mittvibes auth:login' first.",
		);
	}

	const client = MittwaldAPIV2Client.newWithToken(token);

	client.axios.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (error.response?.status === 401) {
				cachedClient = null;
				await clearAuthConfig();
				throw new Error(
					"Session expired or invalid. Please run 'mittvibes auth:login' to authenticate again.",
				);
			}
			throw error;
		},
	);

	cachedClient = client;

	return client;
}

export async function getCustomers(): Promise<Customer[]> {
	try {
		const client = await createAPIClient();
		const response = await client.customer.listCustomers();
		assertStatus(response, 200);

		return response.data.map((customer) => ({
			customerId: customer.customerId,
			name: customer.name,
			description: undefined,
		}));
	} catch (error) {
		throw new Error(
			`Failed to fetch customers: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function checkContributorStatus(
	customerId: string,
): Promise<boolean> {
	try {
		const client = await createAPIClient();

		const response = await client.marketplace.extensionGetContributor({
			contributorId: customerId,
		});

		try {
			assertStatus(response, 200);
			return true;
		} catch {
			try {
				assertStatus(response, 404);
				return false;
			} catch {
				throw new Error(`Unexpected response status: ${response.status}`);
			}
		}
	} catch (error) {
		throw new Error(
			`Failed to check contributor status: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function checkContractPartner(
	customerId: string,
): Promise<boolean> {
	try {
		const client = await createAPIClient();

		const response = await client.customer.isCustomerLegallyCompetent({
			customerId,
		});

		assertStatus(response, 200);
		return response.data.isLegallyCompetent === true;
	} catch (error) {
		throw new Error(
			`Failed to check contract partner status: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function getCustomersWithContributorStatus(): Promise<
	CustomerWithContributorStatus[]
> {
	const customers = await getCustomers();

	const customerStatuses = await Promise.allSettled(
		customers.map(async (customer): Promise<CustomerWithContributorStatus> => {
			const isContributor = await checkContributorStatus(customer.customerId);
			return {
				...customer,
				isContributor,
			};
		}),
	);

	return customerStatuses
		.filter(
			(
				result,
			): result is PromiseFulfilledResult<CustomerWithContributorStatus> =>
				result.status === "fulfilled",
		)
		.map((result) => result.value);
}

export async function submitContributorInterest(
	customerId: string,
): Promise<void> {
	try {
		const client = await createAPIClient();

		const response =
			await client.marketplace.contributorExpressInterestToContribute({
				customerId,
				data: {},
			});

		assertStatus(response, 201);
	} catch (error) {
		throw new Error(
			`Failed to submit contributor interest: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function getProjects(): Promise<Project[]> {
	try {
		const client = await createAPIClient();
		const response = await client.project.listProjects();
		assertStatus(response, 200);

		return response.data.map((project) => ({
			id: project.id,
			description: project.description || "",
			createdAt: project.createdAt,
		}));
	} catch (error) {
		throw new Error(
			`Failed to fetch projects: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function getProjectsByCustomer(
	customerId: string,
): Promise<Project[]> {
	try {
		const client = await createAPIClient();
		const response = await client.project.listProjects({
			queryParameters: {
				customerId,
			},
		});
		assertStatus(response, 200);

		return response.data.map((project) => ({
			id: project.id,
			description: project.description || "",
			createdAt: project.createdAt,
		}));
	} catch (error) {
		throw new Error(
			`Failed to fetch projects for customer: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function createExtension(params: {
	contributorId: string;
	name: string;
	context: "customer" | "project";
	description?: string;
	webhookUrl?: string;
	frontendUrl?: string;
}): Promise<{ extensionId: string; extensionSecret: string }> {
	try {
		const client = await createAPIClient();

		// Context-specific path for menu item placement
		const fragmentPath =
			params.context === "customer"
				? "/customers/customer/menu/section/extensions/item"
				: "/projects/project/menu/section/extensions/item";

		const requestData = {
			name: params.name,
			context: params.context,
			description: params.description || `${params.name} extension`,
			scopes: [],
			frontendFragments: {
				[fragmentPath]: {
					url: params.frontendUrl || "http://localhost:5173",
				},
			},
			...(params.webhookUrl && {
				webhookUrls: {
					extensionAddedToContext: { url: params.webhookUrl },
					extensionInstanceRemovedFromContext: { url: params.webhookUrl },
					extensionInstanceSecretRotated: { url: params.webhookUrl },
					extensionInstanceUpdated: { url: params.webhookUrl },
				},
			}),
		};

		const response = await client.marketplace.extensionRegisterExtension({
			contributorId: params.contributorId,
			data: requestData,
		});

		assertStatus(response, 201);

		const extensionId = response.data.id;

		// Wait for extension to be fully created in the system
		await new Promise((resolve) => setTimeout(resolve, 5000));

		const secretResponse =
			await client.marketplace.extensionGenerateExtensionSecret({
				contributorId: params.contributorId,
				extensionId: extensionId,
			});

		assertStatus(secretResponse, 200);
		const extensionSecret = secretResponse.data.secret;

		return { extensionId, extensionSecret };
	} catch (error) {
		throw new Error(
			`Failed to create extension: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

export async function installExtension(
	installData: ExtensionInstallData,
): Promise<void> {
	try {
		const client = await createAPIClient();

		// Wait for extension to be ready
		await new Promise((resolve) => setTimeout(resolve, 5000));

		if (installData.projectId) {
			const requestData = {
				context: "project" as const,
				contextId: installData.projectId,
				extensionId: installData.extensionId,
				consentedScopes: [],
			};

			const response =
				await client.marketplace.extensionCreateExtensionInstance({
					data: requestData,
				});

			assertStatus(response, 201);
		} else if (installData.customerId) {
			const requestData = {
				context: "customer" as const,
				contextId: installData.customerId,
				extensionId: installData.extensionId,
				consentedScopes: [],
			};

			const response =
				await client.marketplace.extensionCreateExtensionInstance({
					data: requestData,
				});

			assertStatus(response, 201);
		} else {
			throw new Error("Either customerId or projectId must be provided");
		}
	} catch (error) {
		throw new Error(
			`Failed to install extension: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}
