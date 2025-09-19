import path from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
  ],
  resolve: {
    alias: [
      // https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
      {
        find: "@tabler/icons-react",
        replacement: "@tabler/icons-react/dist/esm/icons/index.mjs",
      },
      // Fix for @mittwald/ext-bridge exports
      {
        find: /^@mittwald\/ext-bridge$/,
        replacement: path.resolve(
          "node_modules/@mittwald/ext-bridge/dist/js/index-browser.mjs"
        ),
      },
      {
        find: "@mittwald/ext-bridge/browser",
        replacement: path.resolve(
          "node_modules/@mittwald/ext-bridge/dist/js/index-browser.mjs"
        ),
      },
      {
        find: "@mittwald/ext-bridge/node",
        replacement: path.resolve(
          "node_modules/@mittwald/ext-bridge/dist/js/index-node.mjs"
        ),
      },
      {
        find: "@mittwald/ext-bridge/react",
        replacement: path.resolve(
          "node_modules/@mittwald/ext-bridge/dist/js/react.mjs"
        ),
      },
    ],
  },
  optimizeDeps: {
    include: ["@mittwald/flow-remote-react-components"],
    exclude: ["@mittwald/ext-bridge"],
  },
});
