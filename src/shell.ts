import * as cp from 'child_process'

import { Workspace } from './registry'
import { UpdateScript } from './script'

export abstract class UpdateShell extends UpdateScript {
  constructor(name: string) {
    super(name)
  }

  protected run(workspace: Workspace, command: string, ...args: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.log.debug('run', workspace.name, command, ...args)
      const child = cp.exec(`${command} ${args.join(' ')}`, { cwd: workspace.basepath }, error => {
        if (error) this.log.error(error)
      })
      child.stderr.on('data', data => this.args(workspace, process.stderr, data).map(lines => lines).forEach(args => this.log.error(...args)))
      child.stdout.on('data', data => this.args(workspace, process.stdout, data).map(lines => lines).forEach(args => this.log.task(...args)))
      child.addListener('exit', (code, signal) => {
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
