import { input, select } from '@inquirer/prompts'

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
  packageName: string
  isPackagePrivate: boolean
  description: string
}

export async function getPrompts(): Promise<PromptResult> {
  const packageName = await getPackageName()
  const isPackagePrivate = await getIsPackagePrivate()
  const description = await getDescription()

  return {
    packageName,
    isPackagePrivate,
    description,
  }
}
