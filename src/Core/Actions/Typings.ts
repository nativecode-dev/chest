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

  public exec(rootpath: string): Promise<void> {
    return Project.load(rootpath)
      .then(project =>
        this.declarations([project, ...project.children])
          .then(typings => this.typings(project, typings))
      )
      .then(() => void (0))
  }

  private declarations(projects: Project[]): Promise<string[]> {
    return Promise.all(projects.map(project => project.npm))
      .then(npms => npms.map(npm => this.dependencies(npm)))
      .then(deps => deps.reduce((previous, current) => previous.concat(current), []))
      .then(deps => Array.from(new Set(deps)))
  }

  private dependencies(npm: NPM): string[] {
    const deps = Object.keys(npm.dependencies || {})
    const devs = Object.keys(npm.devDependencies || {})
    return Array.from(new Set([...deps, ...devs]))
  }

  private typings(project: Project, typings: string[]): Promise<void> {
    return Promise.all(typings.map(typing => Files.join(project.path, 'node_modules', typing, 'package.json')))
      .then(typings => Promise.all(typings.map(typing => Files.json<NPM>(typing))))
      .then(npms => npms.filter(npm => npm.types || npm.typings).map(npm => npm.name))
      .then(typings => project.json<TsConfig>('tsconfig.json').then(tsconfig => {
        tsconfig.compilerOptions.types = typings
        return tsconfig
      }))
      .then(tsconfig => this.testing ? Files.save('tsconfig.json', tsconfig) : Promise.resolve())
  }
}

Registry.add(Script.Name, new Script())
