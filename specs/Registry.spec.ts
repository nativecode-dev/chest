import 'mocha'

import { expect } from 'chai'

import { Files, Registry, UpdateScript } from '../src/index'

const ScriptName = Files.extensionless(__filename)
const RootScriptName = `${ScriptName}-root`
const ProjectsScriptName = `${ScriptName}-projects`

class DoesNothingGoesNowhereRoot extends UpdateScript {
  constructor() {
    super(RootScriptName)
  }
}

describe('when using the script registry', () => {

  it('should return registered script names', () => expect(Registry.names().length).to.be.gt(0))

  it('should register new script object', () => {
    expect(Registry.contains(RootScriptName)).to.equal(false)
    Registry.add(RootScriptName, new DoesNothingGoesNowhereRoot())
    expect(Registry.contains(RootScriptName)).to.equal(true)
    expect(Registry.get(RootScriptName).name).to.equal(RootScriptName)
  })

  it('should throw error when calling passing invalid to "get"', () => expect(() => Registry.get('invalid')).to.throw())

})
