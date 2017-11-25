import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromise from 'chai-as-promised'

import { Files } from './Files'

const expect = chai.expect

describe('when working with files', () => {

  const artifacts = Files.join(process.cwd(), 'artifacts')
  const invalidDir = Files.join(artifacts, 'double', 'invalid')
  const invalidFile = Files.join(artifacts, 'invalid', 'invalid.json')
  const nonexistant = Files.join(process.cwd(), 'nonexistant')
  const testables = Files.join(process.cwd(), 'testables')
  const workspaces = Files.join(testables, 'workspaces')

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
    return Files.deepdirs(testables).then(dirs => {
      expect(dirs.length).to.not.equal(0)
      expect(dirs).contains(testables)
    })
  })

  it('should get deep listing of files', () => {
    return Files.deepfiles(workspaces).then(files => {
      expect(files.length).to.not.equal(0)
      expect(files).contains(Files.join(workspaces, 'package.json'))
    })
  })

  it('should list files', async () => {
    const filepaths = await Files.listfiles(Files.join(testables, 'single'))
    expect(filepaths).to.contain(Files.join(testables, 'single/package.json'))
    expect(filepaths).to.contain(Files.join(testables, 'single/tsconfig.json'))
  })

  it('should throw error when listing files', (done) => { Files.listfiles(nonexistant).catch(() => done()) })
  it('should throw error when creating directory fails', (done) => { Files.mkdir(invalidDir).catch(() => done()) })
  it('should throw error when reading file fails', (done) => { Files.readfile(invalidFile).catch(() => done()) })
  it('should throw error when reading json fails', (done) => { Files.json(invalidFile).catch(() => done()) })
  it('should throw error when stat file fails', (done) => { Files.statfile(invalidFile).catch(() => done()) })
  it('should throw error when write file fails', (done) => { Files.writefile(invalidFile, {}).catch(() => done()) })

  it('should get file basename', () => expect(Files.basename(invalidFile)).to.equal('invalid.json'))
  it('should get file extension', () => expect(Files.ext(invalidFile)).to.equal('.json'))
  it('should write file', () => Files.writefile(Files.join(artifacts, 'test.json'), {}))

})
