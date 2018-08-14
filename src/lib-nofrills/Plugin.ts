import { PluginContext } from './PluginContext'

export interface Plugin {
  readonly name: string
  execute(context: PluginContext): Promise<PluginContext>
}
