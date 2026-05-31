import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginNext from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default tseslint.config(
  ...compat.extends('next/core-web-vitals'),
  {
    plugins: { '@next/next': pluginNext },
    rules: {
      '@next/next/no-img-element': 'warn',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['discord-bot/**', 'node_modules/**', '.next/**'] },
)
