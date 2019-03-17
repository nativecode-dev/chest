import { Files } from './Files'
import { NPM } from './Interfaces'
import { Log, Logger } from './Logger'

export class Project {
  public static InvalidProject: Project = new Project('invalid', 'invalid')

  private readonly _children: Project[]
  private readonly _name: string
  private readonly _owner: Project | undefined
  private readonly _path: string
  private readonly log: Log

  private constructor(name: string, path: string, owner?: Project) {
    this._children = []
    this._name = name
    this._owner = owner
    this._path = path

    this.log = Logger(`chest:${this.name}`)
  }

  public get children(): Project[] {
    return this._children
  }

  public get name(): string {
    return this._name
  }

  public get owner(): Project | undefined {
    return this._owner
  }

  public get npm(): Promise<NPM> {
    return Files.json<NPM>(Files.join(this.path, 'package.json'))
  }

  public get path(): string {
    return this._path
  }

  public static load(rootpath: string): Promise<Project> {
    return Files.json<NPM>(Files.join(rootpath, 'package.json'))
      .then(npm => ({ npm, project: new Project(npm.name, rootpath) }))
      .then(load => load.project.workspaces(load.npm).then(() => load.project))
  }

  public json<T>(filename: string): Promise<T> {
    return Files.json<T>(Files.join(this.path, filename))
  }

  public save<T>(filename: string, data: T): Promise<void> {
    return Files.save(Files.join(this.path, filename), data)
  }

  private workspaces(npm: NPM): Promise<Project> {
    return this.yarn(this)
  }

  private async yarn(project: Project): Promise<Project> {
    const npm = await this.npm
    if (npm.workspaces) {
      return Promise.all(npm.workspaces.map(async workspace => {
        const workspaceName = workspace.substring(0, workspace.indexOf('/*'))
        const workspacePath = Files.join(project.path, workspaceName)
        const children = await this.loadProjects(workspacePath)
        children.forEach(child => this.children.push(child))
        this.log.debug('yarn-workspace', workspaceName)
      })).then(() => this)
    }
    return this
  }

  private async loadProjects(workspacePath: string): Promise<Project[]> {
    const projects = await Files.listdirs(workspacePath)
    return Promise.all(projects.map(async projectPath => {
      const npmfile = Files.join(projectPath, 'package.json')
      const npm = await Files.json<NPM>(npmfile)
      const child = new Project(npm.name, projectPath, this)
      this.log.debug('added-project', npm.name)
      return child
    }))
  }
}
