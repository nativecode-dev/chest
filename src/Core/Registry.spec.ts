import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { Files } from './Files'
import { UpdaterType } from './Interfaces'
import { Registry } from './Registry'
import { UpdateScript } from './UpdateScript'

const expect = chai.expect
const ScriptName = Files.extensionless(__filename)
const RootScriptName = `${ScriptName}-root`
const ProjectsScriptName = `${ScriptName}-projects`

class DoesNothingGoesNowhereRoot extends UpdateScript {
  constructor() {
    super(RootScriptName, UpdaterType.Root)
  }
}

class DoesNothingGoesNowhereProjects extends UpdateScript {
  constructor() {
    super(ProjectsScriptName, UpdaterType.Projects)
  }
}

describe('', () => {

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromised)
  })

  it('should return registered script names', () => {
    expect(Registry.names().length).to.be.gt(0)
  })

  it('should register new script object', () => {
    expect(Registry.contains(RootScriptName)).to.equal(false)
    Registry.add(RootScriptName, new DoesNothingGoesNowhereRoot())
    expect(Registry.contains(RootScriptName)).to.equal(true)
    expect(Registry.get(RootScriptName).name).to.equal(RootScriptName)
  })

  it('should throw error when calling "get" and script does not exist', () => {
    expect(() => Registry.get('invalid')).to.throw(Error)
  })

})
