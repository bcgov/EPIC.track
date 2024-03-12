import { defineConfig } from "cypress";

export default defineConfig({
  supportFolder: "cypress/support",
  component: {
    supportFile: "cypress/support/component.tsx",
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});
