import * as chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'

export interface Stat {
  dir: boolean
  file: boolean
  filename: string
}

export interface Log {
  debug(...args: any[]): void
  error(...args: any[]): void
  info(...args: any[]): void
  start(...args: any[]): void
  done(...args: any[]): void
  task(...args: any[]): void
}

export function Logger(name: string, category?: string): Log {
  const cat = category ? `:${category}` : ''
  const bold = (name: string) => chalk.default.bold(`[${name}${cat}]`)

  return {
    debug: (...args: any[]): void => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(chalk.default.yellow.inverse(bold(name), ...args))
      }
    },
    error: (...args: any[]): void => {
      console.log(chalk.default.red.inverse(bold(name), ...args))
    },
    info: (...args: any[]): void => {
      console.log(chalk.default.grey.italic(bold(name), ...args))
    },
    start: (...args: any[]): void => {
      console.log(chalk.default.grey.dim(bold(name), ...args))
    },
    done: (...args: any[]): void => {
      console.log(chalk.default.grey.dim(bold(name), ...args))
    },
    task: (...args: any[]): void => {
      console.log(chalk.default.blue(bold(name), ...args))
    }
  }
}

export const exists = (filepath: string): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    fs.exists(filepath, (exists: boolean) => resolve(exists))
  })
}

export const noext = (filename: string): string => {
  const basename = path.basename(filename)
  const extname = path.extname(basename)
  return basename.replace(extname, '')
}

export const readfile = (filepath: string): Promise<Buffer> => {
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

export const listdirs = async (filepath: string): Promise<string[]> => {
  const stats = await statfiles(filepath)
  return stats.filter(stat => stat.dir).map(stat => stat.filename)
}

export const listfiles = async (filepath: string): Promise<string[]> => {
  const stats = await statfiles(filepath)
  return stats.filter(stat => stat.file).map(stat => stat.filename)
}

export const statfile = (filepath: string): Promise<fs.Stats> => {
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

export const statfiles = (filepath: string): Promise<Stat[]> => {
  return new Promise<Stat[]>((resolve, reject) => {
    fs.readdir(filepath, async (error: NodeJS.ErrnoException, files: string[]) => {
      if (error) {
        reject(error)
      } else {
        const promises = files.map(async (filename): Promise<Stat> => {
          const fullpath = path.join(filepath, filename)
          const stat = await statfile(fullpath)
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

export const writefile = (filepath: string, data: any): Promise<void> => {
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

export async function json<T>(filepath: string): Promise<T> {
  if (await exists(filepath)) {
    const buffer = await readfile(filepath)
    return JSON.parse(buffer.toString())
  }

  throw new Error(`requested file ${filepath} does not exist`)
}

export async function save<T>(filepath: string, data: T): Promise<void> {
  await writefile(filepath, JSON.stringify(data, null, 2))
}