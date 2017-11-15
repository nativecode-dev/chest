import * as chalk from 'chalk'

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
