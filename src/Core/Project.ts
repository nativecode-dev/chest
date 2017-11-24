import { Files } from './Files'
import { NPM } from './Interfaces'
import { Log, Logger } from './Logger'

interface LernaConfig {
  packages?: string[]
  useWorkspaces?: boolean
  version: string
}

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

    this.log = Logger(`project:${this.name}`)
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

  public static async load(rootpath: string): Promise<Project> {
    const npmfile = Files.join(rootpath, 'package.json')

    if (await Files.exists(npmfile) === false) {
      return Project.InvalidProject
    }

    const npm = await Files.json<NPM>(npmfile)
    const project = new Project(npm.name, rootpath)

    if (npm.private && npm.workspaces) {
      const result = await project.loadChildProjects(npm)
      return result
    }

    return project
  }

  public json<T>(filename: string): Promise<T> {
    return Files.json<T>(Files.join(this.path, filename))
  }

  public save<T>(filename: string, data: T): Promise<void> {
    return Files.save(Files.join(this.path, filename), data)
  }

  private async loadChildProjects(npm: NPM): Promise<Project> {
    const lernafile = Files.join(this.path, 'lerna.json')
    if (await Files.exists(lernafile)) {
      this.log.debug('lerna-packages', this.path)
      return this.loadLernaPackages(lernafile, this)
    }
    this.log.debug('yarn-workspaces', this.path)
    return this.loadYarnWorkspaces(this)
  }

  private async loadLernaPackages(filepath: string, project: Project): Promise<Project> {
    const lerna = await Files.json<LernaConfig>(filepath)
    if (lerna.packages && lerna.useWorkspaces) {
      lerna.packages.forEach(async workspace => {
        const workspaceName = workspace.substring(0, workspace.indexOf('/*'))
        const workspacePath = Files.join(project.path, workspaceName)
        const children = await this.loadProjects(workspacePath)
        children.forEach(child => this.children.push(child))
        this.log.debug('lerna-package', workspaceName)
      })
    }
    return this
  }

  private async loadYarnWorkspaces(project: Project): Promise<Project> {
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
      const projectName = Files.basename(projectPath)
      const npmfile = Files.join(projectPath, 'package.json')
      const npm = await Files.json<NPM>(npmfile)
      const child = new Project(npm.name, projectPath, this)
      this.log.debug('added-project', npm.name)
      return child
    }))
  }
}
