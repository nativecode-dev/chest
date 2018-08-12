import * as path from 'path'

import { Project } from './Project'
import { CLI, ConsoleOptions } from '@nofrills/console'
import { Logger } from './Logger'

async function main(): Promise<void> {
  const cwd = process.cwd()
  const project = await Project.load(path.join(cwd, 'package.json'))
  Logger.debug(project.name)
}

const options: ConsoleOptions = {
  initializer: main
}
const exe = process.argv[0]
const args = process.argv.slice(1)
new CLI<ConsoleOptions>(options, exe, args).start().catch(console.error)
