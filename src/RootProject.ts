import * as path from 'path'
import * as core from './Core'

export class RootProject {
  private readonly _root: string
  private readonly files: core.Files
  private readonly init: Promise<void>

  constructor(root: string) {
    this._root = root
    this.files = core.Files
    this.init = this.initialize()
  }

  public get root(): string {
    return this._root
  }

  private async initialize(): Promise<void> {
    const npmfile = path.join(this.root, 'package.json')

    if (await this.files.exists(npmfile) === false) {
      throw new Error(`failed to find ${npmfile} in ${this.root}`)
    }

    const npm = await this.files.json<core.NPM>(npmfile)
    if (npm.workspace) {
    } else {
    }
  }
}
