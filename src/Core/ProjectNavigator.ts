import { Files } from './Files'
import { Project } from './Project'

export class ProjectNavigator {
  private readonly project: Project

  constructor(project: Project) {
    this.project = project
  }

  public get js(): Promise<string[]> {
    return this.filterByExtension(this.project.path, '.js')
  }

  public get json(): Promise<string[]> {
    return this.filterByExtension(this.project.path, '.json')
  }

  public get jsx(): Promise<string[]> {
    return this.filterByExtension(this.project.path, '.jsx')
  }

  public get ts(): Promise<string[]> {
    return this.filterByExtension(this.project.path, '.ts')
  }

  public get tsx(): Promise<string[]> {
    return this.filterByExtension(this.project.path, '.tsx')
  }

  async filterByExtension(filepath: string, ext: string): Promise<string[]> {
    const files = await Files.listdirs(filepath)
    return files.filter(dir => Files.ext(dir.toLowerCase()) === ext.toLowerCase())
  }
}
