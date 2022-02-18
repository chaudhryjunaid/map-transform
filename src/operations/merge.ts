import deepmerge = require('deepmerge')
import { Operation, State, MapDefinition } from '../types'
import {
  getStateValue,
  setStateValue,
  shouldSkipMutation,
} from '../utils/stateHelpers'
import { mapFunctionFromDef } from '../utils/definitionHelpers'

const isNullOrUndefined = (value: unknown): value is null | undefined =>
  value === null || value === undefined

export function mergeExisting<T, U>(
  target: T[],
  source: U[]
): U | (U | T | (U & T))[] {
  if (Array.isArray(target)) {
    const arr = source.slice()
    target.forEach((value, index) => {
      // eslint-disable-next-line security/detect-object-injection
      arr[index] = deepmerge(source[index], value, {
        arrayMerge: mergeExisting,
      })
    })
    return arr
  }
  return target
}

function mergeStates(state: State, thisState: State) {
  const target = getStateValue(state)
  const source = getStateValue(thisState)
  return setStateValue(
    state,
    isNullOrUndefined(source)
      ? target
      : isNullOrUndefined(target)
      ? source
      : deepmerge(target, source, { arrayMerge: mergeExisting })
  )
}

export default function merge(...defs: MapDefinition[]): Operation {
  return (options) => {
    const skipMutation = shouldSkipMutation(options)
    if (defs.length === 0) {
      return (state) => setStateValue(state, undefined)
    }
    const pipelines = defs.map((def) => mapFunctionFromDef(def)(options))

    return (state) =>
      skipMutation(state)
        ? setStateValue(state, undefined)
        : pipelines.map((pipeline) => pipeline(state)).reduce(mergeStates)
  }
}
