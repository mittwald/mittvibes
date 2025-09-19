import { Spinner, Text, Content } from "@mittwald/flow-remote-react-components";
import type { ReactNode } from "react";

interface LoaderProps {
	children?: ReactNode;
}

export function Loader({ children }: LoaderProps) {
	return (
		<Content>
			<Spinner />
			{children && (
				<Content>
					<Text>{children}</Text>
				</Content>
			)}
		</Content>
	);
}