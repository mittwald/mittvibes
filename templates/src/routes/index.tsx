import { Button, Heading, Text, LayoutCard, Content } from "@mittwald/flow-remote-react-components";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getHelloWorld } from "~/server/functions/getHelloWorld";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: helloData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["helloWorld"],
		queryFn: () => getHelloWorld(),
	});

	return (
		<Content>
			<Heading>Welcome to Your mittwald Extension! 🚀</Heading>
			<Text>
				This is your extension's main page. You can start building your features
				here.
			</Text>

			{isLoading && <Text>Loading...</Text>}

			{error && (
				<Text>
					Error: {error instanceof Error ? error.message : "Unknown error"}
				</Text>
			)}

			{helloData && (
				<Content>
					<Text style={{ fontWeight: "bold" }}>
						Server Response:
					</Text>
					<pre style={{
						background: "#f5f5f5",
						padding: "1rem",
						borderRadius: "4px",
						fontFamily: "monospace",
						fontSize: "0.9rem",
						overflow: "auto"
					}}>
						{JSON.stringify(helloData, null, 2)}
					</pre>
				</Content>
			)}


			<Button onPress={() => refetch()}>Refresh Data</Button>
		</Content>
	);
}