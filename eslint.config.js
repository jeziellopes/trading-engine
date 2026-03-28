import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint is retained ONLY for React Compiler rules (eslint-plugin-react-hooks).
// All other linting, formatting, and import rules are handled by Biome.
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
])
