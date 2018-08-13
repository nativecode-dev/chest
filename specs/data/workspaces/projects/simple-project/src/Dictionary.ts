export interface Dictionary {
  [key: string]: string
}

export interface DictionaryOf<T> {
  [key: string]: T
}
