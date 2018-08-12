import { FileSystem as fs } from '@nofrills/fs'

import { ConfigHandlerRegistry, ProjectConfig } from './ProjectConfig'
import { Lincoln, Logger } from './Logger'
import { NotFound } from './Errors'

const logger = Logger.extend('project')

export class Project {
  private readonly children: Project[] = []
  private readonly configmap: { [key: string]: ProjectConfig } = {}

  protected readonly log: Lincoln

  private constructor(private readonly root: string) {
    this.log = logger.extend(this.name)
  }

  get name(): string {
    return fs.basename(this.path)
  }

  get path(): string {
    return this.root
  }

  projects(): Project[] {
    return this.children.slice().sort((a, b) => a.name >= b.name ? 1 : 0)
  }

  static async load(filepath: string): Promise<Project> {
    if (await fs.exists(filepath) === false) {
      throw new NotFound(filepath)
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

  add(project: Project): number {
    this.log.debug('add', this.children.length, project.name)
    return this.children.push(project)
  }

  as<T>(filename: string): T {
    return this.config(filename).as<T>()
  }

  config(filename: string): ProjectConfig {
    const key = fs.join(this.root, filename)
    if (this.configmap[key]) {
      return this.configmap[key]
    }
    throw new NotFound(key)
  }

  protected set(config: ProjectConfig): void {
    this.configmap[config.path] = config
  }
}
