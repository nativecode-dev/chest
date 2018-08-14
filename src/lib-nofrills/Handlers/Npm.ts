import { DictionaryOf } from '@nofrills/collections'
import { Lincoln } from '@nofrills/lincoln'
import { fs } from '@nofrills/fs'

import { Project } from '../Project'
import { ProjectConfig } from '../ProjectConfig'
import { Logger } from '../Logger'

export interface NpmUrl {
  type?: string
  url?: string
}

export interface Npm {
  author?: string | string[] | DictionaryOf<string>
  bugs?: string | NpmUrl
  dependencies?: DictionaryOf<string>
  description?: string
  devDependencies?: DictionaryOf<string>
  homepage?: string
  license?: string
  main?: string
  name: string
  private?: boolean
  repository?: string | NpmUrl
  scripts?: DictionaryOf<string>
  types?: string,
  typeScriptVersion: string
  typings?: string
  version: string
  workspaces?: string[]
}

export const NpmFile = 'package.json'

const logger: Lincoln = Logger.extend('npm')

export async function NpmConfig(project: Project, filepath: string): Promise<ProjectConfig | null> {
  if (fs.basename(filepath).toLowerCase() !== NpmFile) {
    return null
  }

  if (await fs.exists(filepath) === false) {
    return null
  }

  const data = await fs.json<Npm>(filepath)
  const caps = ProjectConfig.getcaps(data)
  const config = new ProjectConfig(filepath, data, caps)

  const log = logger.extend(config.name)

  if (data && data.workspaces) {
    await Promise.all(
      data.workspaces.map(async workspace => {
        const pattern = fs.join(project.path, workspace)
        const packages = await fs.glob(pattern)
        log.debug('resolve', pattern, ...packages)

        return Promise.all(
          packages.map(async path => {
            const projpath = fs.join(path, NpmFile)
            const child = await Project.load(projpath)
            project.add(child)
            log.debug('child', child.name, child.path)
          })
        )
      })
    )
  }

  return config
}
