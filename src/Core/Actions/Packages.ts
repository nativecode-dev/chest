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
    const source = await project.package
    const target = await project.owner.package

    target.author = source.author
    target.bugs = source.bugs
    target.description = source.description
    target.homepage = source.homepage
    target.license = source.license
    target.repository = source.repository

    const filename = path.join(project.path, 'package.json')

    if (this.testing) {
      this.log.task('updated package info', filename, target)
    } else {
      await Files.save(filename, target)
      this.log.task('updated package info', filename)
    }
  }
}

Registry.add(ScriptName, new Script())
