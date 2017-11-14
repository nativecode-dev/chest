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
 * Propogates changes from the root package.json to child
 * packages.
 **/
class Script extends UpdateScript {
  constructor() {
    super(ScriptName)
  }

  public async workspace(workspace: Workspace): Promise<void> {
    const source = await this.npm<NPM>(workspace.root)
    const target = await this.npm<NPM>(workspace.basepath)
    target.author = source.author
    target.bugs = source.bugs
    target.description = source.description
    target.homepage = source.homepage
    target.license = source.license
    target.repository = source.repository

    const filename = path.join(workspace.basepath, 'package.json')
    await files.save(filename, target)
    this.log.task('updated package info', filename)
  }
}

Register(ScriptName, new Script())