import { CompilerOptions } from 'typescript'
import { Files, NPM, Project, Registry, UpdateScript, UpdaterType } from '../index'

interface TsConfig {
  compilerOptions: CompilerOptions
}

/*
 * Updates the "types" property of "tsconfig.json" files by
 * looking for types from @types.
 **/
class Script extends UpdateScript {
  public static Name = Files.extensionless(__filename)
  constructor() {
    super(Script.Name, UpdaterType.Root)
  }

  public async exec(rootpath: string): Promise<void> {
    this.log.task('exec', rootpath)
    const project = await Project.load(rootpath)

    if (project === Project.InvalidProject) {
      this.log.error(`failed to load any projects at ${rootpath}`)
      return
    }

    const tsconfig = await project.json<TsConfig>('tsconfig.json')
    const definitions: string[] = []
    const deps = project.children.map(async child => {
      this.log.debug('child project', child.name)
      const dependencies = await this.gatherTypeDefinitions(child)
      dependencies.forEach(dependency => definitions.push(dependency))
    })

    return Promise.all(deps)
      .then(async () => {
        tsconfig.compilerOptions.types = Array.from(new Set(definitions)).sort()

        if (this.testing) {
          this.log.task('tsconfig', project.path, JSON.stringify(tsconfig, null, 2))
        } else {
          await project.save('tsconfig.json', tsconfig)
          this.log.task('tsconfig', project.path)
        }
      })
  }

  private async gatherTypeDefinitions(project: Project): Promise<string[]> {
    const npm = await project.npm
    let dependencies: string[] = []

    if (npm.dependencies) {
      dependencies = dependencies.concat(Object.keys(npm.dependencies))
    }

    if (npm.devDependencies) {
      dependencies = dependencies.concat(Object.keys(npm.devDependencies))
    }

    const owner = project.owner || project
    const modulesPath = Files.join(owner.path, 'node_modules')

    const deps = dependencies.map(async dependency => {
      const dependencyPath = Files.join(modulesPath, dependency, 'package.json')
      this.log.debug('dependencies', dependencyPath)

      if (await Files.exists(dependencyPath)) {
        const npm = await Files.json<NPM>(dependencyPath)
        if (npm.types || npm.typings) {
          this.log.debug('found dependency', dependency)
          return dependency
        }
      } else {
        this.log.debug('failed to find', dependencyPath)
      }
      return ''
    })

    return Promise.all(deps)
      .then(values => values.filter(value => value))
      .then(values => Array.from(new Set<string>(values)))
  }
}

Registry.add(Script.Name, new Script())
