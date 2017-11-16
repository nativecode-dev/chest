import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { Chest } from './Chest'
import { Files, Project, Registry } from './Core'

const expect = chai.expect

describe('when using RootProject to load a project', () => {

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromised)
  })

  it('should load single npm project', async () => {
    const directory = Files.join(process.cwd(), 'testables', 'single')
    const project = await Chest.project(directory)
    const projects = await Chest.projects(project)
    expect(projects.length).to.equal(1)
    expect(projects[0].name).to.equal('project-single')
    expect(projects[0].path).to.equal(directory)
  })

  it('should load yarn workspace project', async () => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces')
    const project = await Chest.project(directory)
    const projects = await Chest.projects(project)
    expect(projects.length).to.equal(2)
    expect(projects[0].name).to.equal('simple-package')
    expect(projects[1].name).to.equal('simple-project')
    expect(projects[0].owner).to.not.equal(undefined)
    expect(projects[0].owner).to.not.equal(undefined)
  })

  it('should return static InvalidProject when single project does not exist', () => {
    const directory = Files.join(process.cwd(), 'testables', 'nonexistant')

    return Chest.project(directory).then(project => expect(project).to.equal(Project.InvalidProject))
  })

  it('should throw error when workspace project has no child projects', () => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces-invalid')
    return Chest.project(directory).then(async project => {
      const projects = await Chest.projects(project)
      expect(projects).to.deep.equal([Project.InvalidProject])
    })
  })

  it('should run scripts for single project', (done) => {
    const directory = Files.join(process.cwd(), 'testables', 'single')
    const args = Object.keys(Registry.all())
    return Chest.run(directory, ...args)
  })

  it('should run scripts for workspace project', (done) => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces')
    const args = Object.keys(Registry.all())
    return Chest.run(directory, ...args)
  })
})
