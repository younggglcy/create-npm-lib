import { defineConfig } from 'rolldown'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  input: {
    cli: 'src/cli.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
  },
  platform: 'node',
  plugins: [
    copy({
      targets: [
        { src: './template', dest: 'dist' },
      ],
    }),
  ],
})
