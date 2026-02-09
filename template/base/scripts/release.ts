import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

function run(command: string) {
  console.log(`$ ${command}`)
  const result = spawnSync(command, {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    shell: true,
  })
  if (result.status !== 0) {
    console.error(`Command failed: ${command}`)
    process.exit(1)
  }
}

// 1. Run changeset version to consume .changeset/*.md files
run('bunx changeset version')

// 2. Read new version from package.json
const pkg = JSON.parse(readFileSync(resolve(ROOT_DIR, 'package.json'), 'utf-8'))
const newVersion = pkg.version
console.log(`New version: ${newVersion}`)

// 3. Stage, commit, tag, push
run('git add -A')
run(`git commit -m "chore: release v${newVersion}"`)
run(`git tag v${newVersion} -m "chore: release v${newVersion}"`)
run('git push')
run('git push --tags')

console.log('Release done.')
