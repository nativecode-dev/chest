import { Dictionary } from './Dictionary'

export interface NPM {
  author?: string | string[] | Dictionary<string>
  bugs?: string | { type: string, url: string }
  dependencies?: Dictionary<string>
  description?: string
  devDependencies?: Dictionary<string>
  homepage?: string
  license?: string
  name: string
  private?: boolean
  repository?: string | { type: string, url: string }
  scripts?: Dictionary<string>
  types?: string,
  typeScriptVersion: string,
  typings?: string
  version: string
  workspace?: string[]
}
