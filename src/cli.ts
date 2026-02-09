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
import { getLatestActiveLTSVersion } from './utils/node_lts'

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
    // Copy base template first
    await copy(resolve(__dirname, 'template', 'base'), pkgFolder, { dereference: true })
    // Overlay variant-specific files
    const variant = promptResult.projectType
    await copy(resolve(__dirname, 'template', variant), pkgFolder, { dereference: true, overwrite: true })
    // For monorepo: rename __PKG__NAME__ directory
    if (variant === 'monorepo') {
      const pkgName = promptResult.packageName
      const pkgsDirSrc = resolve(pkgFolder, 'packages', '__PKG__NAME__')
      const pkgsDirDest = resolve(pkgFolder, 'packages', pkgName)
      if (await exists(pkgsDirSrc)) {
        await copy(pkgsDirSrc, pkgsDirDest)
        const { rm } = await import('node:fs/promises')
        await rm(pkgsDirSrc, { recursive: true, force: true })
      }
    }
    logger.end('Template files copied')

    logger.start('Modifying template files')
    await writeTemplate(pkgFolder, {
      ...promptResult,
      lts: await getLatestActiveLTSVersion(),
    })
    logger.end('Template files modified')

    logger.start('Installing dependencies')
    await x`bun install`
    logger.end('Dependencies installed')

    logger.start('Updating dependencies')
    await x`bun update`
    logger.end('Dependencies updated')

    logger.start('Preparing husky')
    await x`bunx husky init`
    await writeFile(
      resolve(pkgFolder, '.husky', 'pre-commit'),
      'bunx lint-staged\n',
    )
    logger.end('Husky prepared')

    logger.start('Running lint fix')
    await x`bun run lint:fix`
    logger.end('Lint fix done')

    logger.start('Commit & Add tag')
    await x`git add .`
    await x`git commit -m "chore: initial commit"`
    await x`git tag v0.0.0 -m "chore: initial version"`
    logger.end('Commit & Tag done')

    logger.success('All done! Happy coding :)')
  })

program.parse()
