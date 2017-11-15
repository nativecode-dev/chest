import * as fs from 'fs'
import * as path from 'path'

export interface Stat {
  dir: boolean
  file: boolean
  filename: string
}

export class Files {
  public exists(filepath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.exists(filepath, (exists: boolean) => resolve(exists))
    })
  }

  public extensionless(filename: string): string {
    const basename = path.basename(filename)
    const extname = path.extname(basename)
    return basename.replace(extname, '')
  }

  public readfile(filepath: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filepath, (error: NodeJS.ErrnoException, data: Buffer) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  public async listdirs(filepath: string): Promise<string[]> {
    const stats = await this.statfiles(filepath)
    return stats.filter(stat => stat.dir).map(stat => stat.filename)
  }

  public async listfiles(filepath: string): Promise<string[]> {
    const stats = await this.statfiles(filepath)
    return stats.filter(stat => stat.file).map(stat => stat.filename)
  }

  public async statfile(filepath: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
      fs.stat(filepath, (error: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (error) {
          reject(error)
        } else {
          resolve(stats)
        }
      })
    })
  }

  public statfiles(filepath: string): Promise<Stat[]> {
    return new Promise<Stat[]>((resolve, reject) => {
      fs.readdir(filepath, async (error: NodeJS.ErrnoException, files: string[]) => {
        if (error) {
          reject(error)
        } else {
          const promises = files.map(async (filename): Promise<Stat> => {
            const fullpath = path.join(filepath, filename)
            const stat = await this.statfile(fullpath)
            return {
              dir: stat.isDirectory(),
              file: stat.isFile(),
              filename: fullpath,
            }
          })

          const stats = await Promise.all(promises)

          resolve(stats)
        }
      })
    })
  }

  public writefile(filepath: string, data: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filepath, data, (error: NodeJS.ErrnoException) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  public async json<T>(filepath: string): Promise<T> {
    if (await this.exists(filepath)) {
      const buffer = await this.readfile(filepath)
      return JSON.parse(buffer.toString())
    }

    throw new Error(`requested file ${filepath} does not exist`)
  }

  public async save<T>(filepath: string, data: T): Promise<void> {
    await this.writefile(filepath, JSON.stringify(data, null, 2))
  }
}