const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

// The import boundary around src/api; src/api/README.md explains it.
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
  {
    group: ["api/*/*", "**/api/*/*"],
    message:
      "Import src/api/<domain> through its index; DTOs, mappers and ID enums stay inside src/api.",
  },
];

const noComponentsPattern = {
  group: ["components/**", "**/components/**"],
  message:
    "src/api and src/models sit below the screens; move the shared type down.",
};

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
      "no-restricted-imports": ["error", { patterns: apiBoundaryPatterns }],
    },
  },
  {
    files: ["src/**/*.d.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["src/models/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [...apiBoundaryPatterns, noComponentsPattern] },
      ],
    },
  },
  {
    // src/api may use the HTTP client and other domains' internals.
    files: ["src/api/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noComponentsPattern] }],
    },
  },
  {
    // Allowed to use the HTTP client directly.
    files: [
      "src/apiManager/**",
      "src/services/**",
      "src/components/axiosErrorHandler/**",
    ],
    rules: { "no-restricted-imports": "off" },
  },
];
