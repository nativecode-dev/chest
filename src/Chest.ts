import { Log, Logger, Project, Registry, UpdaterType } from './Core'

export class Chest {
  private static readonly log: Log = Logger('chest')

  public static async run(root: string, ...args: string[]): Promise<void> {
    Chest.log.debug('run', root, ...args)

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
