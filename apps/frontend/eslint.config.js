const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ["dist/**", "coverage/**", "web-build/**"],
  },
  ...compat.extends("expo"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        __dirname: "readonly",
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^#[0-9A-Fa-f]{3,8}$/]",
          message:
            "Use a Tailwind token instead of an inline hex color (e.g., text-text-primary, bg-surface).",
        },
      ],
    },
  },
  {
    files: ["eslint.config.js", "jest.setup.js", "__tests__/**", "tailwind.config.js"],
    rules: {
      "no-undef": "off",
      "no-restricted-syntax": "off",
    },
  },
];
