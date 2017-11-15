import { Dictionary } from './Dictionary'

export interface NPM {
  author?: string | string[] | Dictionary
  bugs?: string | { type: string, url: string }
  dependencies?: Dictionary
  description?: string
  devDependencies?: Dictionary
  homepage?: string
  license?: string
  name: string
  private?: boolean
  repository?: string | { type: string, url: string }
  scripts?: Dictionary
  types?: string,
  typeScriptVersion: string,
  typings?: string
  version: string
  workspace?: string[]
}
