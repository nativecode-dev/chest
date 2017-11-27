import * as path from 'path'

import { Files, NPM, Project, Registry, UpdateScript, UpdaterType } from '../index'

/*
 * Propogates changes from the root package.json to child
 * packages.
 **/
class Script extends UpdateScript {
  public static readonly Name: string = Files.extensionless(__filename)

  constructor() {
    super(Script.Name, UpdaterType.Projects)
  }

  public async workspace(project: Project): Promise<Project> {
    if (project.owner) {
      const source = await project.owner.npm
      const target = await project.npm

      target.author = source.author
      target.bugs = source.bugs
      target.description = source.description
      target.homepage = source.homepage
      target.license = source.license
      target.repository = source.repository

      const filename = path.join(project.path, 'package.json')

      if (this.testing) {
        /* istanbul ignore next */
        this.log.task('workspace', filename, JSON.stringify(target, null, 2))
      } else {
        await Files.save(filename, target)
        this.log.task('workspace', filename)
      }
    }

    return project
  }
}

Registry.add(Script.Name, new Script())
