import { Project } from '../Project'
import { Registry } from '../Registry'
import { UpdateScript } from '../UpdateScript'

export class Yarn extends UpdateScript {
  public static readonly Name: string = 'yarn'

  constructor() {
    super(Yarn.Name)
  }

  public exec(project: Project): Promise<Project> {
    return super.exec(project)
      .then(project => this.run(project, 'yarn').then(() => project))
  }

  protected workspace(project: Project): Promise<Project> {
    return super.exec(project)
      .then(project => this.run(project, 'yarn').then(() => project))
  }
}

Registry.add(Yarn.Name, new Yarn())
