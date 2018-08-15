import { Plugin, PluginContext } from '@nofrills/projector'

import { Logger } from '../Logger'

export class DistTag implements Plugin {
  private readonly log = Logger.extend('dist-tag')

  get name(): string {
    return 'dist-tag'
  }

  execute(context: PluginContext): Promise<PluginContext> {
    if (context.stage === this.name) {
      this.log.debug(context.project.name)
    }
    return Promise.resolve(context)
  }
}
