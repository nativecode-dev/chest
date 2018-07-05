import 'mocha'

import { FileSystem as fs } from '@nofrills/fs'
import { expect } from 'chai'
import { Npm, Project } from '../src/index'

describe('when using Project', () => {

  const cwd = fs.join(process.cwd(), 'specs/data')

  describe('to load an existing package.json file', () => {

    it('should load project correctly', async () => {
      const path = fs.join(cwd, 'single', 'package.json')
      const project = await Project.load(path)
      const config = project.config('package.json')
      const npm = config.as<Npm>()
      expect(npm.name).equals('project-single')
    })

    it('should load workspace project correctly', async () => {
      const path = fs.join(cwd, 'workspaces', 'package.json')
      const project = await Project.load(path)
      const config = project.config('package.json')
      const npm = config.as<Npm>()
      expect(npm.name).equals('project-workspaces')
      expect(project.projects().length).equals(2)
    })

  })

})
