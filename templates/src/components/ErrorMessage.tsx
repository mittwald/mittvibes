import { Alert, Text, Heading } from "@mittwald/flow-remote-react-components";

interface ErrorMessageProps {
	message: string;
	title?: string;
}

export function ErrorMessage({ message, title = "Error" }: ErrorMessageProps) {
	return (
		<Alert status="danger">
			<Heading level={4}>{title}</Heading>
			<Text>{message}</Text>
		</Alert>
	);
}
