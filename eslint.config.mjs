import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// eslint-config-next is not used: its plugin pulls in a glob library with an
// unpatched advisory (GHSA-vfj7-8cjw-p6xm). Revisit when a fix ships.
export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "Never use dangerouslySetInnerHTML. Render rich text with the Contentful renderer.",
        },
      ],
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "contentful-management",
              message:
                "Get clients from src/lib/contentful/management.ts so the master guard always runs.",
              allowTypeImports: true,
            },
            {
              name: "contentful-migration",
              message: "Run migrations through src/lib/contentful/migration-runner.ts so the master guard always runs.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/lib/contentful/management.ts", "src/lib/contentful/migration-runner.ts", "tests/**"],
    rules: { "@typescript-eslint/no-restricted-imports": "off" },
  },
]);
