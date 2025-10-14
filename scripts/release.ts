import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

release()

function release() {
  console.log('Preparing package for release...')

  if (!existsSync(resolve(ROOT_DIR, 'CHANGELOG.md'))) {
    console.log('No CHANGELOG.md found, creating one...')
    spawnSync(
      `pnpm exec conventional-changelog -p angular -r 0`,
      { stdio: 'inherit', cwd: ROOT_DIR, shell: true },
    )
  }
  else {
    console.log('Editing CHANGELOG.md...')
    spawnSync(
      `pnpm exec conventional-changelog -p angular`,
      { stdio: 'inherit', cwd: ROOT_DIR, shell: true },
    )
  }

  console.log('Bumpping version...')
  spawnSync(
    `pnpm exec bumpp -p false`,
    { stdio: 'inherit', cwd: ROOT_DIR, shell: true },
  )

  console.log('Commit --amend --no-edit for CHANGELOG.md')
  spawnSync(
    `git add CHANGELOG.md && git commit --amend --no-edit`,
    { stdio: 'inherit', cwd: ROOT_DIR, shell: true },
  )

  console.log('Pushing to remote...')
  spawnSync(
    `git push && git push --tags`,
    { stdio: 'inherit', cwd: ROOT_DIR, shell: true },
  )

  console.log('Release done.')
  process.exit(0)
}
