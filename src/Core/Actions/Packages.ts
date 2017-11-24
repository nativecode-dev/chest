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
 * Propogates changes from the root package.json to child
 * packages.
 **/
class Script extends UpdateScript {
  constructor() {
    super(ScriptName, UpdaterType.Projects)
  }

  public async workspace(project: Project): Promise<void> {
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
        this.log.task('workspace', filename, JSON.stringify(target, null, 2))
      } else {
        await Files.save(filename, target)
        this.log.task('workspace', filename)
      }
    }
  }
}

Registry.add(ScriptName, new Script())
