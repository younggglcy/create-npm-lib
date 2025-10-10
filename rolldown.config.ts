import { defineConfig } from 'rolldown'

export default defineConfig({
  input: {
    cli: 'src/cli.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
  },
  platform: 'node',
})
