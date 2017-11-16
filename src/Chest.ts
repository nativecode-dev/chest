import * as path from 'path'

import { Files, Log, Logger, NPM, Project, Registry, UpdaterType } from './Core'

export class Chest {
  private static readonly Log: Log = Logger('chest')

  public static async run(root: string, ...args: string[]): Promise<void> {
    const project = await Chest.project(root)
    const projects = await Chest.projects(project)
    const updaters = Registry.all()

    Object.keys(updaters).forEach(async name => {
      const updater = updaters[name]

      if (updater.type === UpdaterType.Root) {
        await updater.exec(root)
      } else {
        await Promise.all(projects.map(child => updater.workspace(child)))
      }
    })
  }

  public static async project(root: string): Promise<Project> {
    const npmfile = path.join(root, 'package.json')

    if (await Files.exists(npmfile) === false) {
      Chest.Log.error(new Error(`failed to find ${npmfile} in [${root}]`))
      return Project.InvalidProject
    }

    const npm = await Files.json<NPM>(npmfile)
    return new Project(npm.name, root)
  }

  public static async projects(owner: Project): Promise<Project[]> {
    const project = await Chest.project(owner.path)
    const npm = await project.package
    this.Log.debug('project', project.name)

    if (npm.private && npm.workspace) {
      return npm.workspace.map(workspaceRoot => Chest.workspaces(project, workspaceRoot))
        .reduce(async (previous, current) => (await previous).concat(await current), Promise.resolve([]))
    }

    return [project]
  }

  private static async workspaces(owner: Project, workspaceRoot: string): Promise<Project[]> {
    workspaceRoot = Files.join(owner.path, workspaceRoot.substring(0, workspaceRoot.indexOf('/*')))

    if (await Files.exists(workspaceRoot) === false) {
      Chest.Log.error(new Error(`[workspace] failed to find ${workspaceRoot} in [${owner.name}]`))
      return [Project.InvalidProject]
    }

    const projects = await Files.listdirs(workspaceRoot)

    return Promise.all(projects.map(async projectPath => {
      const npmfile = path.join(projectPath, 'package.json')
      const npm = await Files.json<NPM>(npmfile)
      const project = new Project(npm.name, projectPath, owner)
      this.Log.debug('project.workspace', owner.name, '->', project.name)
      return project
    }))
  }
}
