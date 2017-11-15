import { Dictionary } from './Dictionary'

export interface Workspace {
  basepath: string
  configs: Dictionary
  name: string
  npm: string
  root: string
}
