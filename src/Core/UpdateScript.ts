import * as cp from 'child_process'
import * as path from 'path'

import { Files, Log, Logger, Project, Updater } from './index'

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

  public get testing(): boolean {
    const env = (process.env.NODE_ENV || '').toLowerCase()
    return ['test', 'testing'].some(value => value === env)
  }

  public exec(project: Project): Promise<Project> {
    return project.children && project.children.length
      ? Promise.all(project.children.map(child => this.workspace(child))).then(() => project)
      : Promise.resolve(project)
  }

  protected workspace(project: Project): Promise<Project> {
    return Promise.resolve(Project.InvalidProject)
  }

  protected npm<NPM>(basepath: string): Promise<NPM> {
    const filename = path.join(basepath, 'package.json')
    return Files.exists(filename).then(() => Files.json<NPM>(filename))
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
