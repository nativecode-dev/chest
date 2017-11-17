import * as path from 'path'

import { Files, Log, Logger, NPM, Project, Registry, UpdaterType } from './Core'

export class Chest {
  private static readonly Log: Log = Logger('chest')

  public static async run(root: string, ...args: string[]): Promise<void> {
    const project = await Project.load(root)
    const updaters = Registry.all()

    Object.keys(updaters).forEach(async name => {
      const updater = updaters[name]

      if (updater.type === UpdaterType.Root) {
        await updater.exec(root)
      } else {
        await Promise.all(project.children.map(child => updater.workspace(child)))
      }
    })
  }
}
