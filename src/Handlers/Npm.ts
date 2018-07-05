import { Dictionary } from '@nofrills/collections'
import { Lincoln } from '@nofrills/lincoln'
import { fs } from '@nofrills/fs'

import { Project } from '../Project'
import { ProjectConfig } from '../ProjectConfig'
import { Logger } from '../Logger'

export interface Npm {
  author?: string | string[] | Dictionary<string>
  bugs?: string | { type: string, url: string }
  dependencies?: Dictionary<string>
  description?: string
  devDependencies?: Dictionary<string>
  homepage?: string
  license?: string
  main?: string
  name: string
  private?: boolean
  repository?: string | { type: string, url: string }
  scripts?: Dictionary<string>
  types?: string,
  typeScriptVersion: string
  typings?: string
  version: string
  workspaces?: string[]
}

const logger: Lincoln = Logger.extend('npm')

export async function NpmConfig(project: Project, filepath: string): Promise<ProjectConfig | null> {
  if (fs.basename(filepath).toLowerCase() !== 'package.json') {
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
            const projpath = fs.join(path, 'package.json')
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
