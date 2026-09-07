import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import fs from "fs-extra";
import { render } from "ink";
import React from "react";

const waitForOutput = async (readOutput, expectedOutput) => {
	const timeoutAt = Date.now() + 3_000;

	while (!readOutput().includes(expectedOutput)) {
		if (Date.now() >= timeoutAt) {
			throw new Error(
				`Timed out waiting for output: ${expectedOutput}. Received: ${JSON.stringify(readOutput())}`,
			);
		}

		await new Promise((resolve) => setTimeout(resolve, 10));
	}
};

test("already-authenticated login does not enable terminal input", async (t) => {
	const temporaryHome = await fs.mkdtemp(
		path.join(os.tmpdir(), "mittvibes-login-test-"),
	);
	const originalHomeDirectory = os.homedir;
	os.homedir = () => temporaryHome;

	t.after(async () => {
		os.homedir = originalHomeDirectory;
		await fs.remove(temporaryHome);
	});

	const { LoginCommand } = await import("../dist/components/LoginCommand.js");
	const { saveAuthConfig } = await import("../dist/utils/config.js");
	await saveAuthConfig({ accessToken: "test-token" });

	const rawModeChanges = [];
	const stdin = new PassThrough();
	stdin.isTTY = true;
	stdin.ref = () => stdin;
	stdin.unref = () => stdin;
	stdin.setRawMode = (isRawModeEnabled) => {
		rawModeChanges.push(isRawModeEnabled);
		return stdin;
	};

	let output = "";
	const stdout = new PassThrough();
	stdout.columns = 80;
	stdout.on("data", (chunk) => {
		output += chunk.toString();
	});

	const instance = render(React.createElement(LoginCommand), {
		stdin,
		stdout,
		stderr: stdout,
		patchConsole: false,
	});

	t.after(() => {
		instance.unmount();
		stdin.destroy();
		stdout.destroy();
	});

	await waitForOutput(() => output, "You are already authenticated");

	assert.deepEqual(rawModeChanges, []);
});
