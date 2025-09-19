import {
	IllustratedMessage,
	LoadingSpinner,
	Text,
} from "@mittwald/flow-remote-react-components";

export function Loader() {
	return (
		<IllustratedMessage>
			<LoadingSpinner />
			<Text>Es wird geladen...</Text>
		</IllustratedMessage>
	);
}
