import { Updater, Updaters } from './interfaces'

const Registry: Updaters = {}

export function GetRegistered(name: string): Updater {
  return Registry[name]
}

export function Register(name: string, updater: Updater): void {
  Registry[name] = updater
}

export function Registered(): string[] {
  return Object.keys(Registry)
}
