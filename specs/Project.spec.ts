import 'mocha'

import { FileSystem as fs } from '@nofrills/fs'

import expect from './expect'
import { NotFound, Npm, NpmFile, Project } from '../src'

describe('when using Project', () => {

  const cwd = fs.join(process.cwd(), 'specs/data')
  const single = fs.join(cwd, 'single', NpmFile)
  const workspaces = fs.join(cwd, 'workspaces', NpmFile)

  it('should fail to load non-existant project file', () => {
    const invalidProjectFile = fs.join(cwd, 'workspaces-no-exist', NpmFile)
    expect(Project.load(invalidProjectFile)).to.eventually.be.rejectedWith(NotFound)
  })

  describe('to load an existing package.json file', () => {

    it('should fail to load non-existant configuration', async () => {
      const sut = await Project.load(single)
      expect(() => sut.as('config-not-exist.json')).to.throw(NotFound)
    })

    it('should load a stand-alone project', async () => {
      const sut = await Project.load(single)
      const config = sut.config(NpmFile)
      const npm = config.as<Npm>()
      expect(npm.name).to.equal('project-single')
    })

    it('should load workspaces defined in a project', async () => {
      const sut = await Project.load(workspaces)
      expect(sut.projects()).to.be.length(2)
    })

  })

  describe('working with workspaces', () => {
    let project: Project

    before(async () => {
      project = await Project.load(workspaces)
    })

    it('should get child configuration', () => {
      const expected = ['simple-package', 'simple-project']
      const children = project.projects().map((child, index) => {
        const npm = child.as<Npm>(NpmFile)
        expect(npm.name).to.equal(expected[index])
        return child
      })
      expect(children).to.be.length(2)
    })

  })

})
