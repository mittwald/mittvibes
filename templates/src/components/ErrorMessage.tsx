import { Alert, Text } from "@mittwald/flow-remote-react-components";

interface ErrorMessageProps {
	message: string;
	title?: string;
}

export function ErrorMessage({ message, title = "Error" }: ErrorMessageProps) {
	return (
		<Alert status="danger">
			<Text style={{ fontWeight: "bold" }}>{title}</Text>
			<br />
			<Text>{message}</Text>
		</Alert>
	);
}
