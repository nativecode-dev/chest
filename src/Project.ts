import { FileSystem as fs } from '@nofrills/fs'

import { ConfigHandlerRegistry, ProjectConfig } from './ProjectConfig'
import { Lincoln, Logger } from './Logger'

const logger = Logger.extend('project')

export class Project {
  private readonly children: Project[] = []
  private readonly configmap: { [key: string]: ProjectConfig } = {}
  protected readonly log: Lincoln

  private constructor(
    private readonly root: string
  ) {
    this.log = logger.extend(this.name)
  }

  get name(): string {
    return fs.basename(this.path)
  }

  get path(): string {
    return this.root
  }

  get projects(): Project[] {
    return this.children
  }

  static async load(filepath: string): Promise<Project> {
    if (await fs.exists(filepath) === false) {
      throw new Error(`could not access project configuration: ${filepath}`)
    }

    const project = new Project(fs.dirname(filepath))
    const filename = fs.basename(filepath)
    const handler = ConfigHandlerRegistry.resolve(filename)
    const logger = project.log

    logger.debug(filename)

    if (handler) {
      const config = await handler(project, filepath)

      if (config) {
        project.set(config)
      }
    }

    return project
  }

  as<T>(filename: string): T {
    const config = this.config(filename)
    if (config) {
      config.as<T>()
    }
    return {} as T
  }

  config(filename: string): ProjectConfig {
    const key = fs.join(this.root, filename)
    if (this.configmap[key]) {
      return this.configmap[key]
    }
    throw new Error(`project configuration not found: ${key}`)
  }

  protected set(config: ProjectConfig): void {
    this.configmap[config.path] = config
  }
}
