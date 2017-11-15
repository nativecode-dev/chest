import { Project } from './Project'

export class Workspace {
  private readonly _project: Project

  constructor(project: Project) {
    this._project = project
  }

  public get project(): Project {
    return this._project
  }
}
