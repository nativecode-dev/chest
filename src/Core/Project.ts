export class Project {
  private readonly _name: string
  private readonly _owner: Project
  private readonly _path: string

  constructor(name: string, path: string, owner?: Project) {
    this._name = name
    this._owner = owner || this
    this._path = path
  }

  public get name(): string {
    return this._name
  }

  public get owner(): Project {
    return this._owner
  }

  public get path(): string {
    return this._path
  }
}
