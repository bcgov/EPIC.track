const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

// Code outside the API layer must go through src/api/<domain>, not the HTTP
// client or raw endpoint paths. Warnings for now; errors once every domain the
// backend rewrite and the DEMI move touch has been migrated.
const apiBoundaryPatterns = [
  {
    // ApiError is what the domain modules throw, so anything may import it.
    group: ["**/apiManager/**", "apiManager/**", "!**/apiManager/apiError"],
    message: "Call the domain module in src/api instead of the HTTP client.",
  },
  {
    group: ["**/constants/api-endpoint", "constants/api-endpoint"],
    message: "Endpoint paths belong inside src/api/<domain>.",
  },
];

module.exports = [
  {
    ignores: [
      "build/**",
      "coverage/**",
      "node_modules/**",
      "public/**",
      // Tests are not linted yet, matching the typecheck scope.
      "**/*.cy.ts",
      "**/*.cy.tsx",
      "src/**/__test__/**",
      "src/**/__tests__/**",
      // Insights move to Centre; this code is left as is until it's deleted.
      "src/components/insights/**",
      "src/services/rtkQuery/**",
      "src/services/insightService/**",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...tsPlugin.configs["eslint-recommended"].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
      "no-restricted-imports": ["warn", { patterns: apiBoundaryPatterns }],
    },
  },
  {
    files: ["src/**/*.d.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    // Allowed to use the HTTP client directly.
    files: [
      "src/api/**",
      "src/apiManager/**",
      "src/services/**",
      "src/components/axiosErrorHandler/**",
    ],
    rules: { "no-restricted-imports": "off" },
  },
];
