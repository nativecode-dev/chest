import * as path from 'path'

import { Files, NPM, Project } from './Core'

export class Chest {
  public static async projects(root: string): Promise<Project[]> {
    const npmfile = path.join(root, 'package.json')

    if (await Files.exists(npmfile) === false) {
      throw new Error(`failed to find ${npmfile} in ${root}`)
    }

    const npm = await Files.json<NPM>(npmfile)
    const project = new Project(npm.name, root)

    if (npm.private && npm.workspace) {
      return npm.workspace
        .map(async workspaceRoot => await Chest.workspaces(project, workspaceRoot))
        .reduce(async (previous: Promise<Project[]>, current: Promise<Project[]>): Promise<Project[]> => {
          return (await previous).concat(await current)
        }, Promise.resolve([]))
    }

    return [project]
  }

  private static async workspaces(owner: Project, workspaceRoot: string): Promise<Project[]> {
    workspaceRoot = Files.join(owner.path, workspaceRoot.substring(0, workspaceRoot.indexOf('*')))

    if (await Files.exists(workspaceRoot) === false) {
      throw new Error(`failed to find workspace ${workspaceRoot} in ${owner.name}`)
    }

    const projects = await Files.listdirs(workspaceRoot)

    return Promise.all(projects.map(async project => {
      const npmfile = path.join(project, 'package.json')
      const npm = await Files.json<NPM>(npmfile)
      return new Project(npm.name, project, owner)
    }))
  }
}
