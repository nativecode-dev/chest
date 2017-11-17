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
    try {
      this.log.task('exec', rootpath)
      const project = await Project.load(rootpath)

      if (project === Project.InvalidProject) {
        this.log.error(`failed to load any projects at ${rootpath}`)
        return
      }

      const tsconfig = await project.json<TsConfig>('tsconfig.json')
      const declarations: string[] = []

      await Promise.all(project.children.map(async child => {
        const dependencies = await this.gatherTypeDefinitions(project)
        dependencies.forEach(dependency => declarations.push(dependency))
      })).then(async () => {
        tsconfig.compilerOptions.types = declarations.sort()

        if (this.testing) {
          this.log.task('tsconfig', JSON.stringify(tsconfig, null, 2))
        } else {
          await project.save('tsconfig.json', tsconfig)
          this.log.task('tsconfig')
        }
      })
    } catch (error) {
      this.log.error(error)
    }
  }

  private async gatherTypeDefinitions(project: Project): Promise<string[]> {
    const npm = await project.package
    let dependencies: string[] = []

    if (npm.dependencies) {
      dependencies = dependencies.concat(Object.keys(npm.dependencies))
    }

    if (npm.devDependencies) {
      dependencies = dependencies.concat(Object.keys(npm.devDependencies))
    }

    const modulesPath = Files.join(project.path, 'node_modules')

    return Promise.all(dependencies.map(async dependency => {
      const dependencyPath = Files.join(modulesPath, dependency, 'package.json')
      this.log.debug('dependencies', dependencyPath)
      if (await Files.exists(dependencyPath)) {
        const npm = await Files.json<NPM>(dependencyPath)
        if (npm.types || npm.typings) {
          this.log.debug('found dependency', dependency)
          return dependency
        }
      }
      return ''
    })).then(values => values.filter(value => value))
  }
}

Registry.add(ScriptName, new Script())
