import 'mocha'

import { expect } from 'chai'
import { Files, Project, Registry, TypeScriptOptions } from '../index'

const TIMEOUT = 5000

const testables = Files.join(process.cwd(), 'testables')
const single = Files.join(testables, 'single')
const workspaces = Files.join(testables, 'workspaces')

describe('when collecting type declarations', () => {

  it('should execute single', () => {
    const script = Registry.get('typings')
    return Project.load(single).then(project =>
      script.exec(project)
        .then(project => project.json<TypeScriptOptions>('tsconfig.json'))
        .then(json => expect(json.compilerOptions.types).to.contain('chalk'))
    )
  }).timeout(TIMEOUT)

  it('should execute workspaces', () => {
    const script = Registry.get('typings')
    return Project.load(workspaces).then(project =>
      script.exec(project)
        .then(project => project.json<TypeScriptOptions>('tsconfig.json'))
        .then(json => expect(json.compilerOptions.types).to.contain('chalk'))
    )
  }).timeout(TIMEOUT)

})
