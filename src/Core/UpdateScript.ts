import * as cp from 'child_process'
import * as path from 'path'

import { Files, Log, Logger, Project, Updater, UpdaterType } from './index'

export abstract class UpdateScript implements Updater {
  protected readonly log: Log
  private readonly _name: string
  private readonly _type: UpdaterType

  constructor(name: string, type: UpdaterType) {
    this._name = name
    this._type = type
    this.log = Logger(name)
  }

  public get name(): string {
    return this._name
  }

  public get testing(): boolean {
    const env = process.env.NODE_ENV || ''
    return ['test', 'testing'].some(value => value === env.toLowerCase())
  }

  public get type(): UpdaterType {
    return this._type
  }

  public exec(rootpath: string): Promise<void> {
    return Promise.resolve()
  }

  public workspace(project: Project): Promise<void> {
    return Promise.resolve()
  }

  protected async npm<NPM>(basepath: string): Promise<NPM> {
    const filename = path.join(basepath, 'package.json')

    if (await Files.exists(filename)) {
      return Files.json<NPM>(filename)
    }

    throw Error(`could not find 'package.json' in ${basepath}`)
  }

  protected run(project: Project, command: string, ...args: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.log.debug('run', project.name, command, ...args)

      const child = cp.exec(`${command} ${args.join(' ')}`, { cwd: project.path }, error => {
        if (error) this.log.error(error)
      })

      child.stderr.on('data', data =>
        this.args(project, process.stderr, data)
          .map(lines => lines)
          .forEach(args => this.log.error(...args))
      )

      child.stdout.on('data', data =>
        this.args(project, process.stdout, data)
          .map(lines => lines)
          .forEach(args => this.log.task(...args))
      )

      child.addListener('exit', (code: number, signal: string) => {
        if (code === 0) {
          resolve()
        } else {
          reject(signal)
        }
      })
    })
  }

  private args(project: Project, stream: NodeJS.WriteStream, data: string | Buffer): string[][] {
    const format = (lines: string[]): string[][] => {
      return lines.filter(line => line.trim()).map(line => [project.name, '>', line])
    }

    if (data instanceof Buffer) {
      return format(data.toString().replace('\r', '').split('\n'))
    }
    return format(data.replace('\r', '').split('\n'))
  }
}
