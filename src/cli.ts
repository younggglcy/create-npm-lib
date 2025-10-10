import { Command } from 'commander'
import { description, name, version } from '../package.json' assert { type: 'json' }

const program = new Command()

program.name(name)
  .version(version)
  .description(description)

program.parse()
