import { Files, NPM, Project, Registry, TypeScriptConfig, UpdateScript } from '../index'

/*
 * Updates the "types" property of "tsconfig.json" files by
 * looking for types from @types.
 **/
class Script extends UpdateScript {
  public static Name = Files.extensionless(__filename)

  constructor() {
    super(Script.Name)
  }

  public exec(project: Project): Promise<Project> {
    return super.exec(project).then(project =>
      this.dependencies([project, ...project.children])
        .then(typings => this.typings(project, typings))
        .then(() => project)
    )
  }

  private dependencies(projects: Project[]): Promise<string[]> {
    return Promise.all(projects.map(project => project.npm))
      .then(npms => npms.map(npm => this.mergedeps(npm)))
      .then(deps => deps.reduce((previous, current) => previous.concat(current), []))
      .then(deps => Array.from(new Set(deps)).sort())
  }

  private mergedeps(npm: NPM): string[] {
    const deps = Object.keys(npm.dependencies || {})
    const devs = Object.keys(npm.devDependencies || {})
    return Array.from(new Set([...deps, ...devs])).sort()
  }

  private typings(project: Project, typings: string[]): Promise<void> {
    return Promise.all(typings.map(typing => Files.join(project.path, 'node_modules', typing, 'package.json')))
      .then(typings => Promise.all(typings.map(typing => Files.json<NPM>(typing))))
      .then(npms => {
        npms.forEach(npm => this.log.info('dependency', npm.name))
        return npms
      })
      .then(npms => npms.filter(npm => npm.types || npm.typings || npm.typeScriptVersion))
      .then(npms => {
        npms.forEach(npm => this.log.task(`${npm.name} ->`, npm.types || npm.typings || npm.name))
        return npms
      })
      .then(npms => project.json<TypeScriptConfig>('tsconfig.json').then(tsconfig => {
        tsconfig.compilerOptions.types = npms.map(npm => npm.name).sort()
        return tsconfig
      }))
      .then(tsconfig => project.save('tsconfig.json', tsconfig))
  }
}

Registry.add(Script.Name, new Script())
