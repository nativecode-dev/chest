import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromise from 'chai-as-promised'

import { Files } from './Files'

const expect = chai.expect

describe('when working with files', () => {

  before(async () => {
    const artifacts = Files.join(process.cwd(), 'artifacts')
    await Files.mkdir(artifacts)
  })

  beforeEach(() => {
    chai.should()
    chai.use(chaiAsPromise)
  })

  it('should write file', () => {
    const filename = Files.join(process.cwd(), 'artifacts', 'test.json')
    return Files.writefile(filename, {})
  })

})
