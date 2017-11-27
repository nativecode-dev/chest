import { Log, Logger, Project, Registry } from './Core'

export class Chest {
  private static readonly log: Log = Logger('chest')

  public static run(cwd: string, ...args: string[]): Promise<void> {
    Chest.log.debug('run', cwd, args)
    const updaters = Registry.all()

    return Project.load(cwd)
      .then(project => Promise.all(
        Object.keys(updaters)
          .filter(scriptname => args.some(arg => arg.toLowerCase() === scriptname.toLowerCase()))
          .map(scriptname => updaters[scriptname])
          .map(script => script.exec(project))
      ))
      .then(() => Chest.log.done('done', cwd))
  }
}
