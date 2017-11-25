import 'mocha'

import { expect } from 'chai'

import { Files, Project, Registry, UpdateScript, UpdaterType } from './index'

const NullScriptName = 'null-update'
const NullScriptsName = 'null-updates'

const testables = Files.join(process.cwd(), 'testables', 'single')
const workspaces = Files.join(process.cwd(), 'testables', 'workspaces')

class NullUpdateScript extends UpdateScript {
  constructor() {
    super(NullScriptName, UpdaterType.Root)
  }
}

class NullUpdateScripts extends UpdateScript {
  constructor() {
    super(NullScriptsName, UpdaterType.Projects)
  }
}

Registry.add(NullScriptName, new NullUpdateScript())
Registry.add(NullScriptsName, new NullUpdateScripts())

describe('when extending update scripts', () => {

  it('should execute in root project', (done) => {
    Registry.get(NullScriptName).exec(testables).then(() => done())
  })

  it('should execute in workspaces project', (done) => {
    const script = Registry.get(NullScriptsName)
    Project.load(workspaces).then(project => script.workspace(project).then(() => done()))
  })

})
