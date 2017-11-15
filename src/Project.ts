export class Project {
  private readonly _name: string
  private readonly _path: string

  constructor(name: string, path: string) {
    this._name = name
    this._path = path
  }

  public get name(): string {
    return this._name
  }

  public get path(): string {
    return this._path
  }
}
