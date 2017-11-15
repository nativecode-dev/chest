import { Workspace } from './Workspace'

export interface Updater {
  name: string
  exec(rootpath: string): Promise<void>
  workspace(workspace: Workspace): Promise<void>
}

export type Updaters = {
  [key: string]: Updater
}
