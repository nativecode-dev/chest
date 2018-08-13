import { FileSystem as fs } from '@nofrills/fs'

export type ProjectFilesFilter = (filepath: string) => boolean

export class ProjectFiles {
  protected constructor(
    public name: string,
    private readonly pattern: string,
  ) {
  }

  static create(name: string, pattern: string): ProjectFiles {
    return new ProjectFiles(name, pattern)
  }

  async files(filter?: ProjectFilesFilter): Promise<string[]> {
    if (filter) {
      const list = await fs.glob(this.pattern)
      return list.filter(value => filter(value))
    }
    return fs.glob(this.pattern)
  }
}
