// @flow strict

/*::
export type Mutable<a> = {
  [string]:a;
}

export type Immutable<a> = {
  +[string]:a;
}

export type Dictionary<a> =
  | Mutable<a>
  | Immutable<a>
*/

const EMPTY /*:Immutable<any>*/ = {}

export const mutable = /*::<a>*/ (
  dictionary /*:Mutable<a>*/ = {}
) /*:Mutable<a>*/ => dictionary

export const immutable = /*::<a>*/ (
  dictionary /*:Dictionary<a>*/ = EMPTY
) /*:Immutable<a>*/ => dictionary

export const has = /*::<a>*/ (
  dictionary /*:Dictionary<a>*/,
  key /*:string*/
) /*:boolean*/ => key in dictionary

export const isEmpty = /*::<a>*/ (
  dictionary /*:Dictionary<a>*/
) /*:boolean*/ => {
  for (const key in dictionary) {
    return false
  }
  return true
}

export const get = /*::<a, b>*/ (
  dictionary /*:Dictionary<a>*/,
  key /*:string*/,
  fallback /*:b*/
) /*:a|b*/ => (key in dictionary ? dictionary[key] : fallback)

export const assign = /*::<a>*/ (
  dictionary /*:Mutable<a>*/,
  key /*:string*/,
  value /*:a*/
) => {
  if (dictionary[key] === value) {
    return dictionary
  } else {
    dictionary[key] = value
    return dictionary
  }
}

export const set = /*::<a>*/ (
  dictionary /*:Immutable<a>*/,
  key /*:string*/,
  value /*:a*/
) /*:Immutable<a>*/ => {
  if (dictionary == null) {
    return { [key]: value }
  } else if (dictionary[key] === value) {
    return dictionary
  } else {
    return { ...dictionary, [key]: value }
  }
}

export const reset = /*::<a>*/ (
  dictionary /*:Immutable<a>*/,
  key /*:string*/
) /*:Immutable<a>*/ => {
  if (has(dictionary, key)) {
    const result = { ...dictionary }
    delete result[key]
    return result
  } else {
    return dictionary
  }
}

export const remove = /*::<a>*/ (
  dictionary /*:Mutable<a>*/,
  key /*:string*/
) /*:Mutable<a>*/ => {
  delete dictionary[key]
  return dictionary
}

export function* keys /*::<a>*/(
  dictionary /*:Dictionary<a>*/
) /*:Iterable<string>*/ {
  for (let key in dictionary) {
    yield key
  }
}

export function* values /*::<a>*/(
  dictionary /*:Dictionary<a>*/
) /*:Iterable<a>*/ {
  for (let key in dictionary) {
    yield dictionary[key]
  }
}

export function* entries /*::<a>*/(
  dictionary /*:Dictionary<a>*/
) /*:Iterable<[string, a]>*/ {
  for (let key in dictionary) {
    yield [key, dictionary[key]]
  }
}

export const equals = /*::<a>*/ (
  left /*:Dictionary<a>*/,
  right /*:Dictionary<a>*/
) /*:boolean*/ => {
  if (left === right) {
    return true
  } else {
    for (const key in left) {
      if (!(key in right) || left[key] !== right[key]) {
        return false
      }
    }

    for (const key in right) {
      if (!(key in left)) {
        return false
      }
    }

    return true
  }
}
