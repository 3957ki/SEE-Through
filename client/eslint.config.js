import eslint from "@eslint/js";
import reactDom from "eslint-plugin-react-dom";
import reactHooks from "eslint-plugin-react-hooks";
import reactNamingConvention from "eslint-plugin-react-naming-convention";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      ".git/**",
      ".husky/**",
      ".vscode/**",
      "src/components/ui/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "react-x": reactX,
      "react-dom": reactDom,
      "react-naming-convention": reactNamingConvention,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommendedTypeChecked.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      ...reactHooks.configs.recommended.rules,
      ...reactX.configs["recommended-type-checked"].rules,
      ...reactDom.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Naming convention rules
      "react-naming-convention/filename-extension": [
        "error",
        {
          allow: "as-needed",
          extensions: [".tsx"],
          ignoreFilesWithoutCode: true,
        },
      ],
      "react-naming-convention/component-name": [
        "error",
        { rule: "PascalCase", allowAllCaps: true },
      ],
      "react-naming-convention/context-name": "error",
      "react-naming-convention/use-state": "error",
    },
  }

  // Component files - PascalCase
  // {
  //   files: ["src/components/**/*.tsx", "src/pages/**/*.tsx"],
  //   ignores: ["**/index.tsx"],
  //   rules: {
  //     "react-naming-convention/filename": ["error", "PascalCase"],
  //   },
  // },
  // // // Config and type definition files - kebab-case
  // // {
  // //   files: ["**/*.config.ts", "**/*.d.ts"],
  // //   rules: {
  // //     "react-naming-convention/filename": ["error", "kebab-case"],
  // //   },
  // // },
  // // // Hook files - camelCase
  // // {
  // //   files: ["src/hooks/**/use*.ts", "src/hooks/**/use*.tsx"],
  // //   rules: {
  // //     "react-naming-convention/filename": ["error", "camelCase"],
  // //   },
  // // },
  // // Turn off filename convention for certain files
  // {
  //   files: ["**/main.tsx", "**/vite-env.d.ts", "**/vite.config.ts"],
  //   rules: {
  //     "react-naming-convention/filename": "off",
  //   },
  // }
);
