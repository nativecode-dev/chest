import { Chest } from './Chest'
import { Registry } from './Core'

class CLI {
  private readonly args: string[]

  private constructor(...args: string[]) {
    this.args = args
  }

  public static parse(...args: string[]): CLI {
    return new CLI(...args)
  }

  public async execute(): Promise<void> {
    Registry.execute(process.cwd(), ...this.args)
  }
}

CLI.parse(...process.argv.slice(2)).execute()
