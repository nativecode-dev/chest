import { PluginHost, Project } from '@nofrills/projector'

import { Logger } from './Logger'

export class Chest implements PluginHost {
  private readonly log = Logger

  protected constructor(private readonly filename: string) {
    this.log.debug('new', filename)
  }

  static create(filename: string, stages: string[]): Promise<Chest> {
    const chest = new Chest(filename)
    return chest.execute(stages).then(() => chest)
  }

  async execute(stages: string[]): Promise<void> {
    this.log.debug('stages', ...stages)
    const project = await Project.load(this, this.filename)
    return project.execute(stages)
  }

  get name(): string {
    return 'chest'
  }
}
