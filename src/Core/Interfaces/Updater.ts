import { UpdaterType } from './UpdaterType'
import { Project } from '../Project'

export interface Updater {
  name: string
  type: UpdaterType
  exec(rootpath: string): Promise<Project>
  workspace(project: Project): Promise<Project>
}

export type Updaters = {
  [key: string]: Updater
}
