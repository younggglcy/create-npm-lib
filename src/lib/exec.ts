import { x } from 'tinyexec'

export function createX(cwd: string) {
  return (commands: string | TemplateStringsArray, ...expressions: any[]) => {
    let commandsStr = ''
    if (typeof commands === 'string') {
      commandsStr = commands
    }
    else {
      for (let i = 0; i < commands.length; i++) {
        commandsStr += commands[i]
        if (i < expressions.length) {
          commandsStr += expressions[i]
        }
      }
    }

    const [cmd, ...args] = commandsStr.split(' ')
    return x(cmd, args, {
      nodeOptions: {
        cwd,
        stdio: 'inherit',
      },
    })
  }
}
