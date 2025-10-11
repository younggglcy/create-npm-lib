import { x } from 'tinyexec'

function parseCommand(cmd: string): [string, string[]] {
  const args: string[] = []
  let current = ''
  let inQuote = false
  let quoteChar = ''

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i]
    if ((char === '"' || char === '\'') && !inQuote) {
      inQuote = true
      quoteChar = char
    }
    else if (char === quoteChar && inQuote) {
      inQuote = false
      quoteChar = ''
    }
    else if (char === ' ' && !inQuote) {
      if (current) {
        args.push(current)
        current = ''
      }
    }
    else {
      current += char
    }
  }
  if (current)
    args.push(current)
  return [args[0], args.slice(1)]
}

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

    const [cmd, args] = parseCommand(commandsStr)
    return x(cmd, args, {
      nodeOptions: {
        cwd,
        stdio: 'inherit',
      },
    })
  }
}
