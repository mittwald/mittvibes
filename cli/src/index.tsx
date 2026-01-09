#!/usr/bin/env node

import { render } from "ink";
import { App } from "./components/App.js";

const args = process.argv.slice(2);

try {
	render(<App args={args} />);
} catch (error) {
	console.error("Fatal error:", error);
	process.exit(1);
}
