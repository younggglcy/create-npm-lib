import { input, select } from '@inquirer/prompts'

async function getProjectType() {
  return await select({
    message: 'Project type?',
    choices: [
      { name: 'Single package', value: 'single' as const },
      { name: 'Monorepo', value: 'monorepo' as const },
    ],
  })
}

async function getScope() {
  return await input({
    message: 'Enter the npm scope (e.g. @my-tools):',
    required: true,
    validate: (value) => {
      if (!value.startsWith('@'))
        return 'Scope must start with @'
      return true
    },
  })
}

async function getPackageName() {
  return await input({
    message: 'Enter the package name:',
    required: true,
  })
}

async function getIsPackagePrivate() {
  return await select({
    message: 'Is the package private?',
    choices: [
      { name: 'No', value: false },
      { name: 'Yes', value: true },
    ],
  })
}

async function getDescription() {
  return await input({
    message: 'Enter the package description:',
    default: '',
  })
}

export interface PromptResult {
  projectType: 'single' | 'monorepo'
  packageName: string
  isPackagePrivate: boolean
  description: string
  scope?: string
}

export async function getPrompts(): Promise<PromptResult> {
  const projectType = await getProjectType()

  let scope: string | undefined
  if (projectType === 'monorepo') {
    scope = await getScope()
  }

  const packageName = await getPackageName()
  const isPackagePrivate = await getIsPackagePrivate()
  const description = await getDescription()

  return {
    projectType,
    packageName,
    isPackagePrivate,
    description,
    scope,
  }
}
