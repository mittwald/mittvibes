import type { ErrorComponentProps } from "@tanstack/react-router";
import { ErrorComponent } from "@tanstack/react-router";
import { useEffect } from "react";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <ErrorComponent error={error} />;
}
