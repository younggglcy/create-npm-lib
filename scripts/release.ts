import type { SpawnSyncOptions } from 'node:child_process'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { versionBump } from 'bumpp'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

const ac = new AbortController()

process.on('SIGINT', () => {
  console.log('!!! SIGINT !!!')
  ac.abort()
  process.exit(1)
})
process.on('uncaughtException', errorHandler)
process.on('unhandledRejection', errorHandler)

release()

function errorHandler(err: Error) {
  console.error('Error during release:', err)
  process.exit(1)
}

function doSpawnSync(command: string, options?: SpawnSyncOptions) {
  if (ac.signal.aborted) {
    console.log('Aborted, exit.')
    process.exit(1)
  }
  return spawnSync(
    command,
    {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      shell: true,
      signal: ac.signal,
      ...options,
    },
  )
}

async function release() {
  console.log('Preparing package for release...')

  if (!existsSync(resolve(ROOT_DIR, 'CHANGELOG.md'))) {
    console.log('No CHANGELOG.md found, creating one...')
    doSpawnSync(`pnpm exec conventional-changelog -p angular -r 0`)
  }
  else {
    console.log('Editing CHANGELOG.md...')
    doSpawnSync(`pnpm exec conventional-changelog -p angular`)
  }

  console.log('Bumpping version...')
  const bumpRes = await versionBump({
    push: false,
    tag: false,
    commit: false,
  })

  console.log('Commit CHANGELOG.md && package.json...')

  doSpawnSync(`git stash push`)
  doSpawnSync(`git add CHANGELOG.md packages.json`)
  doSpawnSync(`git commit --message "chore: release v${bumpRes.newVersion}"`)
  doSpawnSync(`git tag v${bumpRes.newVersion} -m "chore: release v${bumpRes.newVersion}"`)
  doSpawnSync(`git stash pop`)

  console.log('Pushing to remote...')
  doSpawnSync(`git push && git push --tags`)

  console.log('Release done.')
  process.exit(0)
}
