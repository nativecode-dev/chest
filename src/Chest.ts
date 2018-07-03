import { Lincoln, Logger, Project, Registry } from './Core'

export class Chest {
  private static readonly log: Lincoln = Logger

  public static run(cwd: string, ...args: string[]): Promise<void> {
    Chest.log.info('run', cwd, ...args)
    const updaters = Registry.all()

    return Project.load(cwd)
      .then(project => Promise.all(
        Object.keys(updaters)
          .filter(scriptname => args.some(arg => arg.toLowerCase() === scriptname.toLowerCase()))
          .map(scriptname => updaters[scriptname])
          .map(script => script.exec(project).then(proj => Chest.log.info('done', '[project]', proj.name)))
      ))
      .then(() => Chest.log.info('done', cwd, args))
  }
}
