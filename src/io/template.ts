import type { PromptResult } from './prompts'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { exists } from 'fs-extra'

interface IContext extends PromptResult {
  lts: string
}

export async function writeTemplate(pkgFolder: string, context: IContext) {
  const { packageName, isPackagePrivate, description, lts, projectType, scope } = context

  const year = new Date().getFullYear()
  const tasks: Promise<void | string>[] = [
    writeNodeVersion(lts, pkgFolder),
    setReleaseJob(!isPackagePrivate, pkgFolder),
    setYearForLicense(year, pkgFolder),
    setReadme(year, packageName, description, pkgFolder),
    setPkgJson(packageName, isPackagePrivate, description, pkgFolder, projectType),
  ]

  if (projectType === 'monorepo' && scope) {
    tasks.push(setMonorepoPkgJson(packageName, scope, description, pkgFolder))
  }

  await Promise.all(tasks)

  return pkgFolder
}

function writeNodeVersion(lts: string, dir: string) {
  return writeFile(
    resolve(dir, '.node-version'),
    `${lts}\n`,
  )
}

function setReleaseJob(shouldRelease: boolean, dir: string) {
  if (shouldRelease)
    return Promise.resolve()

  return rm(resolve(dir, '.github/workflows/release.yml'), { force: true })
}

async function setYearForLicense(year: number, dir: string) {
  const path = resolve(dir, 'LICENSE')
  return writeFile(
    path,
    await readFile(path, 'utf-8').then(content => content.replace('__YEAR__', String(year))),
  )
}

async function setReadme(year: number, name: string, description: string, dir: string) {
  const path = resolve(dir, 'README.md')
  return writeFile(
    path,
    await readFile(path, 'utf-8').then(content => content
      .replaceAll('__PKG__NAME__', name)
      .replaceAll('__PKG__DESC__', description)
      .replace('__YEAR__', String(year)),
    ),
  )
}

async function setPkgJson(name: string, isPrivate: boolean, description: string, dir: string, projectType: 'single' | 'monorepo') {
  const path = resolve(dir, 'package.json')
  const pkgInfo = (await readFile(path, 'utf-8'))
    .replaceAll('__PKG__NAME__', name)
    .replaceAll('__PKG__DESC__', description)
  const pkgInfoObj = JSON.parse(pkgInfo)
  pkgInfoObj.name = name

  if (projectType === 'single') {
    pkgInfoObj.private = isPrivate
  }

  return writeFile(
    path,
    `${JSON.stringify(pkgInfoObj, null, 2)}\n`,
  )
}

async function setMonorepoPkgJson(packageName: string, scope: string, description: string, dir: string) {
  const pkgDir = resolve(dir, 'packages', packageName)
  const path = resolve(pkgDir, 'package.json')

  if (!await exists(path))
    return

  const scopedName = `${scope}/${packageName}`
  const pkgInfo = (await readFile(path, 'utf-8'))
    .replaceAll('__PKG__SCOPED_NAME__', scopedName)
    .replaceAll('__PKG__NAME__', packageName)
    .replaceAll('__PKG__DESC__', description)
  const pkgInfoObj = JSON.parse(pkgInfo)

  return writeFile(
    path,
    `${JSON.stringify(pkgInfoObj, null, 2)}\n`,
  )
}
