import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromise from 'chai-as-promised'

import { Files } from './Files'

const expect = chai.expect

describe('when working with files', () => {

  const artifacts = Files.join(process.cwd(), 'artifacts')
  const nonexistant = Files.join(process.cwd(), 'nonexistant')
  const testables = Files.join(process.cwd(), 'testables')

  before(async () => {
    await Files.mkdir(artifacts)
  })

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromise)
  })

  it('should list directories', async () => {
    const directories = await Files.listdirs(testables)
    expect(directories.length).to.equal(3)
    expect(directories).to.contain(Files.join(process.cwd(), 'testables/single'))
    expect(directories).to.contain(Files.join(process.cwd(), 'testables/workspaces'))
    expect(directories).to.contain(Files.join(process.cwd(), 'testables/workspaces-invalid'))
  })

  it('should throw error when listing directories', (done) => {
    Files.listdirs(nonexistant).catch(() => done())
  })

  it('should get deep listing of directories', () => {
    return Files.deepdirs(testables).then(dirs => console.log(dirs))
  })

  it('should list files', async () => {
    const filepaths = await Files.listfiles(Files.join(testables, 'single'))
    expect(filepaths).to.contain(Files.join(testables, 'single/package.json'))
    expect(filepaths).to.contain(Files.join(testables, 'single/tsconfig.json'))
  })

  it('should throw error when listing files', (done) => {
    Files.listfiles(nonexistant).catch(() => done())
  })

  it('should write file', () => {
    const filename = Files.join(artifacts, 'test.json')
    return Files.writefile(filename, {})
  })

})
