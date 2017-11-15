import * as path from 'path'

import { Files, Log, Logger, NPM, Updater, Workspace } from './index'

export abstract class UpdateScript implements Updater {
  protected readonly log: Log
  private readonly _name: string

  constructor(name: string) {
    this._name = name
    this.log = Logger(name)
  }

  public get name(): string {
    return this._name
  }

  public exec(rootpath: string): Promise<void> {
    return Promise.resolve()
  }

  public workspace(workspace: Workspace): Promise<void> {
    return Promise.resolve()
  }

  protected async npm<NPM>(basepath: string): Promise<NPM> {
    const filename = path.join(basepath, 'package.json')

    if (await Files.exists(filename)) {
      return await Files.json<NPM>(filename)
    }

    throw Error(`could not find 'package.json' in ${basepath}`)
  }

  protected run(workspace: Workspace, command: string, ...args: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.log.debug('run', workspace.name, command, ...args)
      const child = cp.exec(`${command} ${args.join(' ')}`, { cwd: workspace.basepath }, error => {
        if (error) this.log.error(error)
      })
      child.stderr.on('data', data => this.args(workspace, process.stderr, data).map(lines => lines).forEach(args => this.log.error(...args)))
      child.stdout.on('data', data => this.args(workspace, process.stdout, data).map(lines => lines).forEach(args => this.log.task(...args)))
      child.addListener('exit', (code: number, signal: string) => {
        if (code === 0) {
          resolve()
        } else {
          reject(signal)
        }
      })
    })
  }

  private args(workspace: Workspace, stream: NodeJS.WriteStream, data: string | Buffer): string[][] {
    const format = (lines: string[]): string[][] => {
      return lines.filter(line => line.trim()).map(line => [workspace.name, '>', line])
    }

    if (data instanceof Buffer) {
      return format(data.toString().replace('\r', '').split('\n'))
    }
    return format(data.replace('\r', '').split('\n'))
  }
}
