import { fs } from '@nofrills/fs'
import { NpmFile } from '@nofrills/projector'
import { CLI, ConsoleOptions, ProcessArgs } from '@nofrills/console'

import { Chest } from './chest'

const args = ProcessArgs.from(process.argv)

const options: ConsoleOptions = {
  initializer: async () => {
    const cwd = process.cwd()
    const filename = fs.join(cwd, NpmFile)
    await Chest.create(filename, args.normalized)
  },
}

CLI.run<ConsoleOptions>(options, args).catch(console.error)
