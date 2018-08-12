import { CompilerOptions } from 'typescript'

export interface TypeScript {
  compileOnSave?: boolean
  compilerOptions?: CompilerOptions
  exclude?: string[]
  extends?: string
  include?: string[]
}
