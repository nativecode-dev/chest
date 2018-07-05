export * from './Lerna'
export * from './Npm'
export * from './TypeScript'

import { ConfigHandlerRegistry } from '../ProjectConfig'
import { NpmConfig } from './Npm'

ConfigHandlerRegistry.register('package.json', NpmConfig)
