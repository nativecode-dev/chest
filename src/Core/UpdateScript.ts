import * as cp from 'child_process'

import { Log, Logger, Project, Updater } from './index'

export abstract class UpdateScript implements Updater {
  protected readonly log: Log
  private readonly _name: string

  constructor(name: string) {
    this._name = name
    this.log = Logger(`chest:${name}`)
  }

  public get name(): string {
    return this._name
  }

  public exec(project: Project): Promise<Project> {
    const rootProject = project.children && project.children.length
      ? Promise.all(project.children.map(child => this.workspace(child).then(proj => this.log.task(proj.name)))).then(() => project)
      : Promise.resolve(project)

    return rootProject
      .then(() => this.log.start(this.name, project.name))
      .then(() => project)
  }

  protected workspace(project: Project): Promise<Project> {
    return Promise.resolve(project)
      .then(() => this.log.task(this.name, project.name))
      .then(() => project)
  }

  protected run(project: Project, command: string, ...args: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.log.debug('run', project.name, command, ...args)

      const child = cp.exec(`${command} ${args.join(' ')}`, { cwd: project.path }, error => {
        /* istanbul ignore next */
        if (error) {
          this.log.error(error)
        }
      })

      child.stderr.on('data', data =>
        this.stream(project, process.stderr, data)
          .map(lines => lines)
          .forEach(args => this.log.error(...args))
      )

      child.stdout.on('data', data =>
        this.stream(project, process.stdout, data)
          .map(lines => lines)
          .forEach(args => this.log.task(...args))
      )

      child.addListener('exit', (code: number, signal: string) => {
        /* istanbul ignore next */
        if (code === 0) {
          resolve()
        } else {
          reject(signal)
        }
      })
    })
  }

  private stream(project: Project, stream: NodeJS.WriteStream, data: string | Buffer): string[][] {
    const format = (lines: string[]): string[][] => {
      return lines.filter(line => line.trim()).map(line => [project.name, '>', line])
    }

    /* istanbul ignore next */
    if (data instanceof Buffer) {
      return format(data.toString().replace('\r', '').split('\n'))
    }

    return format(data.replace('\r', '').split('\n'))
  }
}
