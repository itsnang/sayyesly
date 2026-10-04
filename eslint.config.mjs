import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Log through `logger` (src/lib/logger): it also reports errors. See docs/adr/0005.
  { files: ["src/**/*.{ts,tsx}"], rules: { "no-console": "error" } },
]);

export default eslintConfig;
