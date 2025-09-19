import {
	Alert,
	Button,
	Content,
	Heading,
	Text,
} from "@mittwald/flow-remote-react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function NotFound() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return (
		<Alert status="danger">
			<Heading>Fehler</Heading>
			<Content>
				<Text>
					Die angeforderte Seite konnte nicht gefunden werden. Bitte überprüfen
					Sie die URL oder versuchen Sie es später erneut.
				</Text>
				<Button
					onPress={() => {
						queryClient.invalidateQueries();
						router.invalidate({ sync: true });
					}}
				>
					Nochmal versuchen
				</Button>
			</Content>
		</Alert>
	);
}
