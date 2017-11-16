import * as path from 'path'
import { Files, Logger, NPM, Project, Registry, Updater, UpdateScript, UpdaterType } from '../index'

const ScriptName = Files.extensionless(__filename)
const log = Logger(ScriptName)
const prefix = '@types'

interface Dependency {
  filename: string
  filepath: string
  npmname: string
  scope?: string
  typings?: string
}

/*
 * Updates the "types" property of "tsconfig.json" files by
 * looking for types from @types.
 **/
class Script extends UpdateScript {
  constructor() {
    super(ScriptName, UpdaterType.Root)
  }

  public async exec(rootpath: string): Promise<void> {
    const tsconfigfile = path.join(rootpath, 'tsconfig.json')
    const packagedir = path.join(rootpath, 'node_modules')

    if (await Files.exists(tsconfigfile) && await Files.exists(packagedir)) {
      const packagedirs = await Files.listdirs(packagedir)
      const tsconfig = await Files.json<any>(tsconfigfile)

      const dependencies = await Promise.all(packagedirs.map(packagedir => {
        this.log.debug('dependency', packagedir)
        return this.map(packagedir)
      }))

      const typings = dependencies.reduce((previous, current) => previous.concat(current.filter(c => !!c.typings)), [])

      tsconfig.compilerOptions.types = typings.map(typing => typing.npmname).sort()

      if (this.testing) {
        this.log.task('updated types', tsconfigfile, JSON.stringify(tsconfig, null, 2))
      } else {
        await Files.save(tsconfigfile, tsconfig)
        this.log.task('updated types', tsconfigfile)
      }
    }
  }

  private async map(packagedir: string): Promise<Dependency[]> {
    const dirname = path.basename(packagedir)

    if (dirname[0] === '@') {
      const scopedirs = await Files.listdirs(packagedir)

      return await Promise.all(scopedirs
        .map(scope => [scope, path.join(scope, 'package.json')])
        .map(async ([scope, scopepath]): Promise<Dependency> => {
          const npm = await Files.json<NPM>(path.join(scope, 'package.json'))

          return {
            filename: 'package.json',
            filepath: scope,
            npmname: npm.name,
            scope: dirname,
            typings: npm.types || npm.typings || npm.typeScriptVersion ? 'index.d.ts' : undefined,
          }
        }))
    }

    const packagefile = path.join(packagedir, 'package.json')

    if (await Files.exists(packagefile)) {
      const npm = await Files.json<NPM>(packagefile)

      return [{
        filename: 'package.json',
        filepath: packagedir,
        npmname: npm.name,
        typings: npm.types || npm.typings || npm.typeScriptVersion ? 'index.d.ts' : undefined,
      }]
    }

    return []
  }
}

Registry.add(ScriptName, new Script())
