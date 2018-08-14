import { ChainsAsync } from '@nofrills/collections'

import { Plugin } from './Plugin'
import { Project } from './Project'
import { PluginContext } from './PluginContext'

export default class Pipeline {
  static async execute(project: Project, stages: string[], plugins: Plugin[]): Promise<void> {
    await Promise.all(
      stages.map(stage => stage.toLowerCase())
        .map<PluginContext>(stage => ({ data: {}, project, stage }))
        .map(context => this.delegate(context, plugins))
    )
  }

  private static delegate(context: PluginContext, plugins: Plugin[]): Promise<PluginContext> {
    const delegates = plugins.map(plugin => plugin.execute)
    const chains = new ChainsAsync<PluginContext>(...delegates)
    return chains.execute(context, () => Promise.resolve(context))
  }
}
