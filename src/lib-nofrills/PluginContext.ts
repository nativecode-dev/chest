import { DictionaryOf } from '@nofrills/collections'

import { Project } from './Project'

export interface PluginContext {
  readonly data: DictionaryOf<any>
  readonly project: Project
  readonly stage: string
}
