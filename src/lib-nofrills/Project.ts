import { EventEmitter } from 'events'
import { FileSystem as fs } from '@nofrills/fs'

import { NotFound } from './Errors'
import { Lincoln, Logger } from './Logger'
import { ProjectFiles } from './ProjectFiles'
import { ConfigHandlerRegistry, ProjectConfig } from './ProjectConfig'

import Registry from './ProjectRegistry'
import Pipeline from './Pipeline'

const logger = Logger.extend('project')

export enum ProjectEvents {
  Config = 'CONFIG',
  Create = 'CREATE',
  Files = 'FILES',
}

export class Project extends EventEmitter {
  private readonly children: Project[] = []
  private readonly configmap: { [key: string]: ProjectConfig } = {}
  private readonly referenceMap: Map<string, ProjectFiles> = new Map<string, ProjectFiles>()

  protected readonly log: Lincoln

  private constructor(private readonly root: string) {
    super()
    this.log = logger.extend(this.name)

    this.emit(ProjectEvents.Create, this)
  }

  get name(): string {
    return fs.basename(this.path)
  }

  get path(): string {
    return this.root
  }

  get references(): Iterable<string> {
    return this.referenceMap.keys()
  }

  execute(stages: string[]): Promise<void> {
    return Pipeline.execute(this,stages, Array.from(Registry.plugins))
  }

  projects(): Project[] {
    return this.children.slice().sort((a, b) => a.name >= b.name ? 1 : 0)
  }

  reference(key: string, files?: ProjectFiles): ProjectFiles {
    if (this.referenceMap.has(key) === false && files) {
      this.referenceMap.set(key, files)
      this.emit(ProjectEvents.Files, files)
    }

    const reference = this.referenceMap.get(key)

    if (reference) {
      return reference
    }

    throw new NotFound(key)
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

      await Pipeline.execute(project, ['load'], Array.from(Registry.plugins))
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
    this.emit(ProjectEvents.Config, config)
  }
}
