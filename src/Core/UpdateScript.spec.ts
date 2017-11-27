import 'mocha'

import { expect } from 'chai'

import { Files, Project, Registry, UpdateScript } from './index'

const NullScriptName = 'null-update'
const NullScriptsName = 'null-updates'

const testables = Files.join(process.cwd(), 'testables', 'single')
const workspaces = Files.join(process.cwd(), 'testables', 'workspaces')

class NullUpdateScript extends UpdateScript {
  constructor() {
    super(NullScriptName)
  }
}

class NullUpdateScripts extends UpdateScript {
  constructor() {
    super(NullScriptsName)
  }
}

Registry.add(NullScriptName, new NullUpdateScript())
Registry.add(NullScriptsName, new NullUpdateScripts())

describe('when extending update scripts', () => {

  it('should execute in root project', (done) => {
    Registry.get(NullScriptName).exec(testables).then(() => done())
  })

})
