import { ensureArray } from '../utils/array.js'
import type { TransformerProps, Transformer } from '../types.js'
import { defToDataMapper } from '../utils/definitionHelpers.js'
import { goForward } from '../utils/stateHelpers.js'
import { isObject } from '../utils/is.js'

export interface Props extends TransformerProps {
  path?: string | string[]
}

// Sort entries with value === undefined before other entries, to make sure that values are not overwritten by `undefined`
const undefinedFirst = (
  [_a, a]: [string, unknown],
  [_b, b]: [string, unknown]
) => (b === undefined && a !== undefined ? 1 : a === undefined ? -1 : 0)

// Merge objects, either from an array of paths that points to objects (or
// arrays of objects) or one path that points to an array of objects.
// Any values in the array (after flattening) that are not objects, will be
// skipped.
const transformer: Transformer<Props> = function merge({ path }) {
  return (options) => {
    const getFns = ensureArray(path).map((path) =>
      defToDataMapper(path, options)
    )

    return async function mergePipelines(data, state) {
      const values = (
        await Promise.all(getFns.map((fn) => fn(data, goForward(state))))
      )
        .flat()
        .filter(isObject)
      return Object.fromEntries(
        values.flatMap(Object.entries).sort(undefinedFirst)
      )
    }
  }
}

export default transformer
