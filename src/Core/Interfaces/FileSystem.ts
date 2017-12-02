import * as fs from 'fs'

import { Stat } from './Stat'

export interface FileSystem {
  basename(filepath: string): string
  deepdirs(rootpath: string): Promise<string[]>
  deepfiles(rootpath: string): Promise<string[]>
  dirname(filepath: string): string
  exists(filepath: string): Promise<boolean>
  ext(filepath: string): string
  extensionless(filename: string): string
  join(...args: string[]): string
  json<T>(filepath: string): Promise<T>
  listdirs(filepath: string): Promise<string[]>
  listfiles(filepath: string): Promise<string[]>
  mkdir(filepath: string): Promise<void>
  mkdirp(filepath: string): Promise<void>
  readfile(filepath: string): Promise<Buffer>
  rename(original: string, filepath: string): Promise<void>
  save<T>(filepath: string, data: T): Promise<void>
  statfile(filepath: string): Promise<fs.Stats>
  statfiles(filepath: string): Promise<Stat[]>
  writefile(filepath: string, data: any): Promise<void>
}
