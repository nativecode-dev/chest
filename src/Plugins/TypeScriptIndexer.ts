import { Plugin, PluginContext } from '@nofrills/projector'

import { Logger } from '../Logger'

export const TypeScriptIndexerName = 'ts-indexer'

export class TypeScriptIndexer implements Plugin {
  private readonly log = Logger.extend(TypeScriptIndexerName)

  get name(): string {
    return TypeScriptIndexerName
  }

  execute(context: PluginContext): Promise<PluginContext> {
    if (context.stage === this.name) {
      this.log.debug(context.project.name)
    }
    return Promise.resolve(context)
  }
}
