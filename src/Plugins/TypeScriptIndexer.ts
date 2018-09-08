import { Plugin, PluginContext, Project, Registry, TypeScriptFile, ProjectSupport } from '@nofrills/projector'

import { Logger } from '../Logger'

export const TypeScriptIndexerName = 'ts-indexer'

export class TypeScriptIndexer implements Plugin {
  private readonly log = Logger.extend(TypeScriptIndexerName)

  get name(): string {
    return TypeScriptIndexerName
  }

  async execute(context: PluginContext): Promise<PluginContext> {
    if (context.stage === this.name) {
      this.log.debug(context.project.name)
    }

    await this.recurse(context.project)

    return Promise.resolve(context)
  }

  private async recurse(project: Project): Promise<void> {
    // Recurse child projects as well.
    const promises = project.projects()
      .map(proj => this.recurse(proj))

    await Promise.all(promises)
  }
}

Registry.plugin(TypeScriptIndexerName, TypeScriptIndexer)
