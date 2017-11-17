import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { Files } from './Files'
import { Project } from './Project'
import { Registry } from './Registry'

const expect = chai.expect

describe('when loading projects', () => {

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromised)
  })

  it('should load single npm project', async () => {
    const directory = Files.join(process.cwd(), 'testables', 'single')
    const project = await Project.load(directory)
    expect(project.children.length).to.equal(0)
    expect(project.name).to.equal('project-single')
    expect(project.path).to.equal(directory)
  })

  it('should load yarn workspace project', async () => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces')
    const project = await Project.load(directory)
    expect(project.children.length).to.equal(2)

    expect(project.children[0].name).to.equal('simple-package')
    expect(project.children[0].owner).to.not.equal(undefined)

    expect(project.children[1].name).to.equal('simple-project')
    expect(project.children[1].owner).to.not.equal(undefined)
  })
})
