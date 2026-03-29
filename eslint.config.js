import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint is retained ONLY for React Compiler rules (eslint-plugin-react-hooks).
// All other linting, formatting, and import rules are handled by Biome.
export default defineConfig([
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    ...reactHooks.configs.flat.recommended,
  },
])
