import 'mocha'

import { expect } from 'chai'
import { Files, Registry } from '../index'

const testables = Files.join(process.cwd(), 'testables')
const single = Files.join(testables, 'single')
const workspaces = Files.join(testables, 'workspaces')

describe('when collecting type declarations', () => {

  it('should execute single', () => {
    const script = Registry.get('typings')
    return script.exec(single)
  })

  it('should execute workspaces', () => {
    const script = Registry.get('typings')
    return script.exec(workspaces)
  })

})
