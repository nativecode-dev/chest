import { FileSystem as fs } from '@nofrills/fs'
import { NpmFile, Project } from '@nofrills/projector'
import { CLI, ConsoleOptions } from '@nofrills/console'

import { Logger } from './Logger'

export class Chest {
  private readonly log = Logger

  protected constructor(private readonly filename: string) {
    this.log.debug('new', filename)
  }

  async execute(stages: string[]): Promise<void> {
    this.log.debug('stages', ...stages)
    const project = await Project.load(this.filename)
    return project.execute(stages)
  }

  static async create(filename: string, stages: string[]): Promise<Chest> {
    const chest = new Chest(filename)
    await chest.execute(stages)
    return chest
  }
}

const exe = process.argv[0]
const args = process.argv.slice(1)

CLI.run<ConsoleOptions>({
  initializer: async () => {
    const cwd = process.cwd()
    const filename = fs.join(cwd, NpmFile)
    await Chest.create(filename, args)
  }
}, exe, ...args).catch(console.error)
