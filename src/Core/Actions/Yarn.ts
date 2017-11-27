import { UpdaterType } from '../Interfaces'
import { Project } from '../Project'
import { Registry } from '../Registry'
import { UpdateScript } from '../UpdateScript'

export class Yarn extends UpdateScript {
  public static readonly Name: string = 'yarn'

  constructor() {
    super(Yarn.Name, UpdaterType.Root)
  }

  public exec(rootpath: string): Promise<Project> {
    return Project.load(rootpath).then(project => this.run(project, 'yarn').then(() => project))
  }
}

Registry.add(Yarn.Name, new Yarn())
