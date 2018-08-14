import { FileSystem as fs } from '@nofrills/fs'

import { Project } from './Project'

export type ProjectFilesFilter = (filepath: string) => boolean

export class ProjectFiles {
  protected constructor(
    private readonly project: Project,
    public key: string,
    private readonly pattern: string,
  ) {
  }

  static create(project: Project, name: string, pattern: string): ProjectFiles {
    const projectFiles = new ProjectFiles(project, name, pattern)
    project.reference(name, projectFiles)
    return projectFiles
  }

  get owner(): Project {
    return this.project
  }

  async files(filter?: ProjectFilesFilter): Promise<string[]> {
    if (filter) {
      const list = await fs.glob(this.pattern)
      return list.filter(value => filter(value))
    }
    return fs.glob(this.pattern)
  }
}
