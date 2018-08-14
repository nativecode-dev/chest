export class NotFound extends Error {
  constructor(
    public readonly name: string,
    public readonly category: string = 'default',
  ) {
    super(`could not find ${category}: ${name}`)
  }
}
