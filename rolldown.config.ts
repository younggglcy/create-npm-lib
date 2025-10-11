import { defineConfig } from 'rolldown'
import copy from 'rollup-plugin-copy'

export default defineConfig((arg) => {
  const isWatch = arg.watch ?? false

  return {
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
        copyOnce: isWatch,
        dereference: true,
        followSymbolicLinks: true,
      }),
    ],
  }
})
