import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { Chest, Files, Registry } from '../src/index'

const TIMEOUT = 5000

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
  }).timeout(TIMEOUT)

  it('should run scripts for workspace project', () => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces')
    const args = Object.keys(Registry.all())
    return Chest.run(directory, ...args)
  }).timeout(TIMEOUT)

})
