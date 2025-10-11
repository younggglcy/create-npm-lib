import type { PromptResult } from './io/prompts'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { copy, ensureDir, exists } from 'fs-extra'
import { description, name, version } from '../package.json' assert { type: 'json' }
import { getPrompts } from './io/prompts'
import { writeTemplate } from './io/template'
import { createX } from './lib/exec'
import { logger } from './utils/logger'
import { getOldestLTSName } from './utils/node_lts'

const program = new Command()

program.name(name)
  .version(version)
  .description(description)

program
  .command('create', { isDefault: true })
  .alias('c')
  .description('Create a new npm package')
  .action(async () => {
    logger.startTotal()

    let promptResult: PromptResult
    try {
      promptResult = await getPrompts()
    }
    catch {
      logger.error('Prompt cancelled, exiting...')
      return
    }

    const pkgFolder = resolve(process.cwd(), promptResult.packageName)
    if (await exists(pkgFolder)) {
      logger.error(`Directory ${pkgFolder} already exists. Please choose a different package name.`)
      return
    }

    logger.start('Creating package directory')
    await ensureDir(pkgFolder)
    logger.end(`Directory ${pkgFolder} created`)

    const x = createX(pkgFolder)

    logger.start('Initializing git repository')
    await x(`git init -b main`)
    logger.end('Git repository initialized')

    logger.start('Copying template files')
    const __dirname = fileURLToPath(new URL('.', import.meta.url))
    await copy(resolve(__dirname, 'template'), pkgFolder, { dereference: true })
    logger.end('Template files copied')

    logger.start('Modifying template files')
    await writeTemplate(pkgFolder, {
      ...promptResult,
      lts: await getOldestLTSName(),
    })
    logger.end('Template files modified')

    logger.start('Installing dependencies')
    await x`ni`
    logger.end('Dependencies installed')

    logger.start('Updating dependencies')
    await x`nu -L`
    logger.end('Dependencies updated')

    logger.start('Preparing husky')
    await x`pnpm exec husky init`
    await writeFile(
      resolve(pkgFolder, '.husky', 'pre-commit'),
      'pnpm exec lint-staged\n',
    )
    logger.end('Husky prepared')

    logger.start('Running lint fix')
    await x`nr lint:fix`
    logger.end('Lint fix done')

    logger.start('Commit & Add tag')
    await x`git add .`
    await x`git commit -m "chore: initial commit"`
    const sha = (await x`git rev-parse HEAD`).stdout.trim()
    await x`git tag -a v0.0.0 -m ${sha}`
    logger.end('Commit & Tag done')

    logger.success('All done! Happy coding :)')
  })

program.parse()
