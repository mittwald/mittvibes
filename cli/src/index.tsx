#!/usr/bin/env node

import { render } from "ink";
import { App } from "./components/App.js";

const args = process.argv.slice(2);
const command = args[0];

try {
	render(<App command={command} />);
} catch (error) {
	console.error("Fatal error:", error);
	process.exit(1);
}
