import * as child_process from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

import { FileSystem, Stat } from './Interfaces'
import { Log, Logger } from './Logger'

class InternalFileSystem implements FileSystem {
  private readonly log: Log = Logger('chest:files')

  public basename(filepath: string): string {
    return path.basename(filepath)
  }

  public deepdirs(filepath: string): Promise<string[]> {
    return this.listdirs(filepath)
      .then(dirs => dirs.map(dir => this.deepdirs(dir)))
      .then(dirs => dirs.reduce((previous, current) => {
        return previous.then(outer => current.then(inner => outer.concat(inner)))
      }, Promise.all([filepath])))
  }

  public deepfiles(filepath: string): Promise<string[]> {
    return this.listdirs(filepath)
      .then(dirs => dirs.map(dir => this.deepfiles(dir)))
      .then(dirs => dirs.reduce((previous, current) => {
        return previous.then(outer => current.then(inner => outer.concat(inner)))
      }, this.listfiles(filepath)))
  }

  public deletefile(filepath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => fs.unlink(filepath, (error: NodeJS.ErrnoException | null) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }))
  }

  public dirname(filepath: string): string {
    return path.dirname(filepath)
  }

  public exists(filepath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => fs.access(filepath, (error: Error | null) => {
      if (error) {
        resolve(false)
      }
      resolve(true)
    }))
  }

  public ext(filepath: string): string {
    return path.extname(filepath)
  }

  public extensionless(filename: string): string {
    const basename = path.basename(filename)
    const extname = path.extname(basename)
    return basename.replace(extname, '')
  }

  public join(...args: string[]): string {
    return path.join(...args)
  }

  public json<T>(filepath: string): Promise<T> {
    return this.exists(filepath).then(exists => {
      return exists
        ? this.readfile(filepath).then(buffer => JSON.parse(buffer.toString()))
        : Promise.reject(new Error(`requested file ${filepath} does not exist`))
    })
  }

  public listdirs(filepath: string): Promise<string[]> {
    return this.statfiles(filepath).then(stats => stats.filter(stat => stat.dir).map(stat => stat.filename))
  }

  public listfiles(filepath: string): Promise<string[]> {
    return this.statfiles(filepath).then(stats => stats.filter(stat => stat.file).map(stat => stat.filename))
  }

  public mkdir(filepath: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      fs.mkdir(filepath, (error: NodeJS.ErrnoException | null) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  public mkdirp(filepath: string): Promise<void> {
    return new Promise<void>((resolve, reject) =>
      child_process.exec(`mkdir -p "${filepath}"`)
        .on('close', code => code === 0 ? resolve() : reject())
        .on('error', error => reject(error))
    )
  }

  public readfile(filepath: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filepath, (error: NodeJS.ErrnoException | null, data: Buffer) => {
        if (error) {
          reject(error)
        } else {
          this.log.debug('read-file', filepath)
          resolve(data)
        }
      })
    })
  }

  public rename(original: string, filepath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => fs.rename(original, filepath, (error: NodeJS.ErrnoException | null) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }))
  }

  public save<T>(filepath: string, data: T): Promise<void> {
    return this.writefile(filepath, JSON.stringify(data, null, 2))
  }

  public statfile(filepath: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
      fs.stat(filepath, (error: NodeJS.ErrnoException | null, stats: fs.Stats) => {
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
      fs.readdir(filepath, async (error: NodeJS.ErrnoException | null, files: string[]) => {
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
      fs.writeFile(filepath, data, (error: NodeJS.ErrnoException | null) => {
        if (error) {
          reject(error)
        } else {
          this.log.debug('write-file', filepath)
          resolve()
        }
      })
    })
  }
}

const files: FileSystem = new InternalFileSystem()
export const Files: FileSystem = files
