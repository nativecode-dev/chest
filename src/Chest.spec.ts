import 'mocha'

import { expect } from 'chai'
import { Chest } from './Chest'
import { Files } from './Core'

describe('when using RootProject to load a project', () => {

  it('should load single npm project', async () => {
    const directory = Files.join(process.cwd(), 'testables', 'single')
    const projects = await Chest.projects(directory)
    expect(projects.length).to.equal(1)
    expect(projects[0].name).to.equal('project-single')
    expect(projects[0].path).to.equal(directory)
  })

  it('should load yarn workspace project', async () => {
    const directory = Files.join(process.cwd(), 'testables', 'workspaces')
    const projects = await Chest.projects(directory)
    expect(projects.length).to.equal(2)
    expect(projects[0].name).to.equal('simple-package')
    expect(projects[1].name).to.equal('simple-project')
    expect(projects[0].owner).to.not.equal(undefined)
    expect((projects[0].owner || { name: 'invalid' }).name).to.equal('project-workspaces')
  })

})
