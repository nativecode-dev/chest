import * as files from '../files'
import * as path from 'path'
import { NPM, Register, Updater, Workspace } from '../registry'
import { UpdateScript } from '../script'

const ScriptName = files.noext(__filename)
const log = files.Logger(ScriptName)
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
    super(ScriptName)
  }

  public async exec(rootpath: string): Promise<void> {
    const tsconfigfile = path.join(rootpath, 'tsconfig.json')
    const packagedir = path.join(rootpath, 'node_modules')

    if (await files.exists(tsconfigfile) && await files.exists(packagedir)) {
      const packagedirs = await files.listdirs(packagedir)
      const tsconfig = await files.json<any>(tsconfigfile)

      const dependencies = await Promise.all(packagedirs.map(async packagedir => await this.map(packagedir)))
      const typings = dependencies.reduce((previous, current) => previous.concat(current.filter(c => !!c.typings)), [])

      tsconfig.compilerOptions.types = typings.map(typing => typing.npmname).sort()
      await files.save(tsconfigfile, tsconfig)

      this.log.task('updated types', tsconfigfile)
    }
  }

  private async map(packagedir: string): Promise<Dependency[]> {
    const dirname = path.basename(packagedir)

    if (dirname[0] === '@') {
      const scopedirs = await files.listdirs(packagedir)

      return await Promise.all(scopedirs
        .map(scope => [scope, path.join(scope, 'package.json')])
        .map(async ([scope, scopepath]): Promise<Dependency> => {
          const npm = await files.json<NPM>(path.join(scope, 'package.json'))

          return {
            filename: 'package.json',
            filepath: scope,
            npmname: npm.name,
            scope: dirname,
            typings: npm.types || npm.typings,
          }
        }))
    }

    const packagefile = path.join(packagedir, 'package.json')

    if (await files.exists(packagefile)) {
      const npm = await files.json<NPM>(packagefile)

      return [{
        filename: 'package.json',
        filepath: packagedir,
        npmname: npm.name,
        typings: npm.types || npm.typings,
      }]
    }

    return []
  }
}

Register(ScriptName, new Script())