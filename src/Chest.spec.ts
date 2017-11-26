import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { Chest } from './Chest'
import { Files, Project, Registry } from './Core'

const expect = chai.expect

describe('when loading projects', () => {

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromised)
  })

  it('should run scripts for single project', () => {
    const directory = Files.join(process.cwd(), 'testables', 'single')
    const args = Object.keys(Registry.all())
    return Chest.run(directory, ...args)
  })

  it('should run scripts for workspace project', () => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces')
    const args = Object.keys(Registry.all())
    return Chest.run(directory, ...args)
  })

})
