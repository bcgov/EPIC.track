import { defineConfig } from "cypress";

export default defineConfig({
  supportFolder: "cypress/support",
  component: {
    supportFile: "cypress/support/component.tsx",
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "**/*.cy.{js,jsx,ts,tsx}",
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    allowCypressEnv: false,
  },
});
