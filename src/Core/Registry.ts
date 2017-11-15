import { Dictionary, Updater, Updaters } from './Interfaces'

export class Registry {
  private static readonly registrations: Updaters = {}

  public static add(name: string, updater: Updater): void {
    this.registrations[name.toLowerCase()] = updater
  }

  public static all(): Dictionary<Updater> {
    return Object.assign({}, this.registrations)
  }

  public static execute(root: string, ...args: string[]): Promise<void[]> {
    return Promise.all(
      args.map(arg => arg.toLowerCase())
        .map(name => this.registrations[name].exec(root))
    )
  }

  public static get(name: string): Updater {
    const key = name.toLowerCase()
    if (this.registrations[key]) {
      return this.registrations[key]
    }

    throw new Error(`no registered updaters named ${name}`)
  }
}
