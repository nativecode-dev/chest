import { Chest } from './index'

Chest.run(process.cwd(), ...process.argv.slice(2))
  .catch(() => process.exit(1))
