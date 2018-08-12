export class NotFound extends Error {
  constructor(name: string) {
    super(`could not find configuration: ${name}`)
  }
}
