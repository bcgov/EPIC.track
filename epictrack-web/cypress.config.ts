import { defineConfig } from "cypress";
import codeCoverageTask from "@cypress/code-coverage/task";

export default defineConfig({
  component: {
    supportFile: "cypress/support/component.tsx",
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
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
