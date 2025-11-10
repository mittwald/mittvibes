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

// Cached API client instance
let cachedClient: MittwaldAPIV2Client | null = null;

// Create API client with authentication and 401 interceptor
async function createAPIClient(): Promise<MittwaldAPIV2Client> {
	// Return cached client if available
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

	// Add Axios response interceptor to handle 401 errors globally
	client.axios.interceptors.response.use(
		(response) => response,
		async (error) => {
			// Check if this is a 401 Unauthorized error
			if (error.response?.status === 401) {
				// Clear the cached client so next call creates a new one
				cachedClient = null;
				// Clear stored auth token
				await clearAuthConfig();
				// Return a more user-friendly error
				throw new Error(
					"Session expired or invalid. Please run 'mittvibes auth:login' to authenticate again.",
				);
			}
			// Re-throw other errors
			throw error;
		},
	);

	// Cache the client
	cachedClient = client;

	return client;
}

// Fetch all customer organizations for the authenticated user
export async function getCustomers(): Promise<Customer[]> {
	try {
		const client = await createAPIClient();
		const response = await client.customer.listCustomers();
		assertStatus(response, 200);

		// Map the response to our Customer interface
		return response.data.map((customer) => ({
			customerId: customer.customerId,
			name: customer.name,
			description: undefined, // CustomerCustomer doesn't have description field
		}));
	} catch (error) {
		throw new Error(
			`Failed to fetch customers: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

// Check if a customer is a contributor
export async function checkContributorStatus(
	customerId: string,
): Promise<boolean> {
	try {
		const client = await createAPIClient();

		// Check contributor status via the marketplace contributor endpoint
		const response = await client.marketplace.extensionGetContributor({
			contributorId: customerId,
		});

		// Use assertStatus with multiple status codes - 200 means contributor, 404 means not
		try {
			assertStatus(response, 200);
			return true; // 200 response means they are a contributor
		} catch {
			// If not 200, check if it's 404 (not a contributor)
			try {
				assertStatus(response, 404);
				return false; // 404 means not a contributor
			} catch {
				// Some other error occurred
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

// Get all customers with their contributor status
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

	// Filter out failed requests and return successful ones
	return customerStatuses
		.filter(
			(
				result,
			): result is PromiseFulfilledResult<CustomerWithContributorStatus> =>
				result.status === "fulfilled",
		)
		.map((result) => result.value);
}

// Submit interest to become a contributor
export async function submitContributorInterest(
	customerId: string,
): Promise<void> {
	try {
		const client = await createAPIClient();

		// Use the actual API endpoint for expressing interest to contribute
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

// Get all projects for a user
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

// Get all projects for a specific customer
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

// Create a new extension for a contributor
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

		// Use context-specific path for frontendFragments
		const fragmentPath =
			params.context === "customer"
				? "/customers/customer/menu/section/extensions/item"
				: "/projects/project/menu/section/extensions/item";

		const requestData = {
			name: params.name,
			context: params.context,
			description: params.description || `${params.name} extension`,
			scopes: [], // Empty for now as requested
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

		// Extract extension ID from response
		const extensionId = response.data.id;

		// Wait 5 seconds for the extension to be fully created in the system
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
		console.error("[DEBUG] Full error:", error);
		throw new Error(
			`Failed to create extension: ${
				error instanceof Error ? error.message : error
			}`,
		);
	}
}

// Install an extension in a customer or project context
export async function installExtension(
	installData: ExtensionInstallData,
): Promise<void> {
	try {
		const client = await createAPIClient();

		// Wait 5 seconds for the extension to be fully ready in the system
		await new Promise((resolve) => setTimeout(resolve, 5000));

		if (installData.projectId) {
			// Install in project context
			const requestData = {
				context: "project" as const,
				contextId: installData.projectId,
				extensionId: installData.extensionId,
				consentedScopes: [], // Empty for now as requested
			};

			const response =
				await client.marketplace.extensionCreateExtensionInstance({
					data: requestData,
				});

			assertStatus(response, 201);
		} else if (installData.customerId) {
			// Install in customer context
			const requestData = {
				context: "customer" as const,
				contextId: installData.customerId,
				extensionId: installData.extensionId,
				consentedScopes: [], // Empty for now as requested
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
