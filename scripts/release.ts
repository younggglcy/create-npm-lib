import type { SpawnOptions, SpawnSyncOptions } from 'node:child_process'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

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

async function doSpawn(command: string, options?: SpawnOptions) {
  if (ac.signal.aborted) {
    console.log('Aborted, exit.')
    process.exit(1)
  }
  const child = spawn(
    command,
    {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      shell: true,
      signal: ac.signal,
      ...options,
    },
  )

  return new Promise<void>((resolve, reject) => {
    child.on('error', (err) => {
      reject(err)
    })
    child.on('exit', (code, singal) => {
      if (code === 0)
        resolve()
      else
        reject(new Error(`Process exited with code ${code}, singal ${singal}`))
    })
  })
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
  await doSpawn(`pnpm exec bumpp -p false`, { killSignal: 'SIGINT' })
    .catch((err) => {
      console.error('Error during bumpp:', err)
      process.exit(1)
    })

  console.log('Commit --amend --no-edit for CHANGELOG.md')
  doSpawnSync(`git add CHANGELOG.md && git commit --amend --no-edit`)

  console.log('Pushing to remote...')
  doSpawnSync(`git push && git push --tags`)

  console.log('Release done.')
  process.exit(0)
}
