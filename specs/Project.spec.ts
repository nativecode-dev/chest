import 'mocha'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { Files, Project } from '../src/index'

const expect = chai.expect

const testables = Files.join(process.cwd(), 'testables')
const single = Files.join(testables, 'single')
const lerna = Files.join(testables, 'workspaces-lerna')
const workspaces = Files.join(testables, 'workspaces')

const TIMEOUT = 10000

describe('when loading projects', () => {

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromised)
  })

  it('should load single npm project', () => {
    return Project.load(single).then(project => {
      expect(project.children.length).to.equal(0)
      expect(project.name).to.equal('project-single')
      expect(project.path).to.equal(single)
    })
  }).timeout(TIMEOUT)

  it('should load yarn lerna project', () => {
    return Project.load(lerna).then(project => {
      expect(project.children.length).to.equal(2)
      expect(project.children[0].owner).to.not.equal(undefined)
      expect(project.children[1].owner).to.not.equal(undefined)
    })
  }).timeout(TIMEOUT)

  it('should load yarn workspace project', () => {
    return Project.load(workspaces).then(project => {
      expect(project.children.length).to.equal(2)
      expect(project.children[0].owner).to.not.equal(undefined)
      expect(project.children[1].owner).to.not.equal(undefined)
    })
  }).timeout(TIMEOUT)

})
