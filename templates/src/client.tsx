/// <reference types="vinxi/types/client" />
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StartClient } from "@tanstack/react-start";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { router } from "./router";

// Error tracking can be added here if needed

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 30, // 30 minutes
		},
	},
});

hydrateRoot(
	document.getElementById("root")!,
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<StartClient router={router} />
		</QueryClientProvider>
	</StrictMode>,
);