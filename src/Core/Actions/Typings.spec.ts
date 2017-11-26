import * as mocha from 'mocha'

import { expect } from 'chai'
import { Files, Registry } from '../index'

const TIMEOUT = 10000

const testables = Files.join(process.cwd(), 'testables')
const single = Files.join(testables, 'single')
const workspaces = Files.join(testables, 'workspaces')

describe('when collecting type declarations', () => {

  before(function (this: mocha.IHookCallbackContext) {
    this.timeout(TIMEOUT)
    const script = Registry.get('yarn')
    return script.exec(single).then(() => script.exec(workspaces))
  })

  it('should execute single', () => {
    const script = Registry.get('typings')
    return script.exec(single)
  })

  it('should execute workspaces', () => {
    const script = Registry.get('typings')
    return script.exec(workspaces)
  })

})
