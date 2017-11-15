import { Project } from '../Project'

export enum UpdaterType {
  Root = 'root',
  Projects = 'projects',
}

export interface Updater {
  name: string
  type: UpdaterType
  exec(rootpath: string): Promise<void>
  workspace(project: Project): Promise<void>
}

export type Updaters = {
  [key: string]: Updater
}
