import { Registry } from '@nofrills/collections'
import { fs } from '@nofrills/fs'

import { Project } from './Project'
import { NpmConfig } from './Handlers/Npm'
import { Lincoln, Logger } from './Logger'
import { ProjectSupport } from './ProjectSupport'

const logger = Logger.extend('config')

export type ProjectConfigHandler = (project: Project, filepath: string) => Promise<ProjectConfig | null>

export const ConfigHandlerRegistry: Registry<ProjectConfigHandler> = new Registry<ProjectConfigHandler>()

export class ProjectConfig {
  protected readonly log: Lincoln

  constructor(
    private readonly filepath: string,
    private readonly config: any,
    private readonly caps: ProjectSupport[]
  ) {
    this.log = logger.extend(fs.basename(this.path))
    this.log.debug('filepath', filepath)
    this.log.debug('caps', ...caps)
  }

  get name(): string {
    return this.config['name'] ? this.config['name'] : undefined
  }

  get path(): string {
    return this.filepath
  }

  static getcaps(config: any): ProjectSupport[] {
    const caps: ProjectSupport[] = []

    for (const key in ProjectSupport) {
      const value = ProjectSupport[key]
      if (config[value]) {
        caps.push(ProjectSupport[key] as ProjectSupport)
      }
    }

    return caps
  }

  as<T>(): T {
    return this.config
  }

  async save(): Promise<boolean> {
    if (await fs.save(this.filepath, this.config)) {
      this.log.debug(`${this.name}:save`, this.filepath)
      return true
    }
    return false
  }

  supports(support: ProjectSupport): boolean {
    return this.caps.indexOf(support) > -1
  }

}

ConfigHandlerRegistry.register('package.json', NpmConfig)
