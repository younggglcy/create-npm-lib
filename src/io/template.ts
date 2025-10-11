import type { PromptResult } from './prompts'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { capitalizeFirstLetter } from '../utils/str'

interface IContext extends PromptResult {
  lts: string
}

export async function writeTemplate(pkgFolder: string, context: IContext) {
  const { packageName, isPackagePrivate, description, lts } = context

  const year = new Date().getFullYear()
  await Promise.all([
    writeNodeVersion(lts, pkgFolder),
    setReleaseJob(!isPackagePrivate, pkgFolder),
    setYearForLicense(year, pkgFolder),
    setReadme(year, packageName, description, pkgFolder),
    setPkgJson(packageName, isPackagePrivate, description, pkgFolder),
  ])

  return pkgFolder
}

function writeNodeVersion(lts: string, dir: string) {
  return writeFile(
    resolve(dir, '.node-version'),
    `lts/${capitalizeFirstLetter(lts)}\n`,
  )
}

function setReleaseJob(shouldRelease: boolean, dir: string) {
  if (shouldRelease)
    return

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
      .replace('__PKG__NAME__', name)
      .replace('__PKG__DESC__', description)
      .replace('__YEAR__', String(year)),
    ),
  )
}

async function setPkgJson(name: string, isPrivate: boolean, description: string, dir: string) {
  const path = resolve(dir, 'package.json')
  const pkgInfo = (await readFile(path, 'utf-8'))
    .replace('__PKG__NAME__', name)
    .replace('__PKG__DESC__', description)
  const pkgInfoObj = JSON.parse(pkgInfo)
  pkgInfoObj.name = name
  pkgInfoObj.private = isPrivate
  return writeFile(
    path,
    `${JSON.stringify(pkgInfoObj, null, 2)}\n`,
  )
}
