import 'mocha'

import { FileSystem as fs } from '@nofrills/fs'

import expect from './expect'
import { NpmConfig, NpmFile, Project } from '../src'

describe('when using the NpmConfig handler', () => {
  let project: Project

  const cwd = fs.join(process.cwd(), 'specs/data')
  const single = fs.join(cwd, 'single', NpmFile)
  const invalidConfig = fs.join(cwd, 'single', 'invalid-config.json')
  const invalidConfigLocation = fs.join(cwd, 'non-existant', NpmFile)

  before(async () => {
    project = await Project.load(single)
  })

  it('should return null when configuration filename is invalid', () => {
    expect(NpmConfig(project, invalidConfig)).to.eventually.be.null
  })

  it('should return null when configuration does not exist', () => {
    expect(NpmConfig(project, invalidConfigLocation)).to.eventually.be.null
  })

})
