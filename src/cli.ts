import './actions'

import * as path from 'path'

import { Dictionary, Files, GetRegistered, Logger, Registered, Updater, Workspace } from './core'

const files = new Files()
const log = Logger('scripts')

const scripts = (command: string, ...args: string[]): Updater[] => {
  switch (command.toLowerCase()) {
    case 'all':
      return Registered().map(name => GetRegistered(name))

    default:
      return Registered()
        .filter(name => args.find(value => value === name))
        .map(name => GetRegistered(name))
  }
}

const workspaces = async (): Promise<Workspace[]> => {
  const CONFIGFILES = [
    '.babelrc',
    'tsconfig.json',
    'tslint.json',
  ]

  interface Config extends Dictionary {
    filename: string
    filepath: string
  }

  const packages = await files.listdirs(path.join(process.cwd(), 'packages'))

  const promises = packages.map(async (dir: string): Promise<Workspace> => {
    const available: Config[] = []
    const dirname = path.basename(dir)

    await Promise.all(CONFIGFILES.map(config => path.join(dir, config))
      .map(async configfile => {
        if (await files.exists(configfile)) {
          available.push({
            filename: path.basename(configfile),
            filepath: path.dirname(configfile),
          })
        }
      }))

    const config: any = {}
    available.forEach(c => config[c.filename] = path.join(c.filepath, c.filename))

    return {
      basepath: dir,
      configs: config,
      name: dirname,
      npm: path.join(dir, 'package.json'),
      root: process.cwd(),
    }
  })

  return Promise.all(promises)
}

const main = async (...args: string[]): Promise<void> => {
  const command = args.length ? args[0] : 'all'
  log.debug('args', args.length, ...args)

  const promises = scripts(command, ...args)
    .map(async script => {
      await script.exec(process.cwd())
      const ws = await workspaces()
      return ws.map(async workspace => {
        try {
          log.start('script.start', workspace.name, script.name)
          await script.workspace(workspace)
          log.done('script.done', workspace.name, script.name)
        } catch (error) {
          log.error('error', workspace.name, script.name, error)
        }
      })
    })

  await Promise.all(promises)
}

main(...process.argv.slice(2))
