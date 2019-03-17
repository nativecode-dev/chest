import { Project } from '../Project'

export interface Updater {
  name: string
  exec(project: Project): Promise<Project>
}

export type Updaters = {
  [key: string]: Updater
}
