export interface Dictionary {
  [key: string]: string
}

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
  typings?: string
  version: string
  workspace?: string[]
}

export interface Updater {
  name: string
  exec(rootpath: string): Promise<void>
  workspace(workspace: Workspace): Promise<void>
}

export type Updaters = {
  [key: string]: Updater
}

export interface Workspace {
  basepath: string
  configs: Dictionary
  name: string
  npm: string
  root: string
}

const registrations: Updaters = {}

export function GetRegistered(name: string): Updater {
  return registrations[name]
}

export function Register(name: string, updater: Updater): void {
  registrations[name] = updater
}

export function Registered(): string[] {
  return Object.keys(registrations)
}