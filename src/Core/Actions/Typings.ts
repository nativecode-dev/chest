import * as path from 'path'
import { CompilerOptions } from 'typescript'
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

interface TsConfig {
  compilerOptions: CompilerOptions
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
    this.log.task('exec', rootpath)
    const project = await Project.load(rootpath)

    if (project === Project.InvalidProject) {
      this.log.error(`failed to load any projects at ${rootpath}`)
      return
    }

    const tsconfig = await project.json<TsConfig>('tsconfig.json')
    tsconfig.compilerOptions.types = await this.gatherTypeDefinitions(project)
  }

  private gatherTypeDefinitions(project: Project): Promise<string[]> {
    return Promise.resolve([])
  }
}

Registry.add(ScriptName, new Script())
