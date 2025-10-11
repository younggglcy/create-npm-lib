import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const ROOT_DIR = resolve(__dirname, '..')

export const PKG_JSON_PATH = resolve(ROOT_DIR, 'package.json')
