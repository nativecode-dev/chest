import { Registry as RegistryMap } from '@nofrills/collections'

import { Plugin } from './Plugin'

export class ProjectRegistry {
  private readonly pluginRegistry: RegistryMap<Plugin> = new RegistryMap<Plugin>()

  get plugins(): Iterable<Plugin> {
    return this.pluginRegistry.values
  }

  plugin(key: string, plugin?: Plugin): Plugin | undefined {
    if (plugin) {
      this.pluginRegistry.register(key, plugin)
    }
    return this.pluginRegistry.resolve(key)
  }
}

const Registry: ProjectRegistry = new ProjectRegistry()

export default Registry
