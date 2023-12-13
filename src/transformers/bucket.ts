import { pathGetter, pathSetter } from '../operations/getSet.js'
import { defToDataMapper } from '../utils/definitionHelpers.js'
import { revFromState, isNonvalue } from '../utils/stateHelpers.js'
import { ensureArray } from '../utils/array.js'
import { isObject } from '../utils/is.js'
import type {
  AsyncTransformer,
  DataMapperWithState,
  AsyncDataMapperWithState,
  TransformerProps,
  TransformDefinition,
  Path,
  State,
  Options,
} from '../types.js'

type PipelineWithKey = [DataMapperWithState | AsyncDataMapperWithState, string]

export interface Bucket {
  key: string
  size?: number
  condition?: TransformDefinition
  pipeline?: TransformDefinition
}

export interface Props extends TransformerProps {
  path?: Path
  buckets?: Bucket[]
}

function addToBucket(
  value: unknown,
  buckets: Map<string, unknown[]>,
  key: string,
) {
  const bucket = buckets.get(key)
  if (bucket) {
    bucket.push(value)
  } else {
    buckets.set(key, [value])
  }
}

async function sortIntoBuckets(
  getFn: DataMapperWithState | AsyncDataMapperWithState,
  pipelines: PipelineWithKey[],
  data: unknown,
  state: State,
) {
  const arr = ensureArray(getFn(data, state))
  const retBucket = new Map<string, unknown[]>()

  for (const value of arr) {
    for (const [pipeline, key] of pipelines) {
      const result = await pipeline(value, state)
      if (result) {
        addToBucket(value, retBucket, key)
        break
      }
    }
  }

  return Object.fromEntries(retBucket.entries())
}

function shouldGoInBucket(
  options: Options,
  condition?: TransformDefinition,
  size?: number,
): AsyncDataMapperWithState {
  let inBucket = 0
  const mapper = condition ? defToDataMapper(condition, options) : undefined
  return async function considerItemForBucket(item, state) {
    if (size === undefined || inBucket < size) {
      if (!mapper || (await mapper(item, state))) {
        inBucket++
        return true
      }
    }
    return false
  }
}

const extractArrayFromBuckets = (
  buckets: unknown,
  keys: string[],
  nonvalues?: unknown[],
) =>
  isObject(buckets)
    ? keys
        // eslint-disable-next-line security/detect-object-injection
        .flatMap((key) => buckets[key])
        .filter((key) => !isNonvalue(key, nonvalues))
    : []

const transformer: AsyncTransformer<Props> = function bucket({
  path = '.',
  buckets = [],
}) {
  return (options) => {
    const getFn = pathGetter(path)
    const setFn = pathSetter(path, options)
    const pipelines: PipelineWithKey[] = buckets
      .filter(({ key }) => typeof key === 'string')
      .map((bucket) => [
        shouldGoInBucket(
          options,
          bucket.condition ?? bucket.pipeline, // Keep `pipeline` as an alias of `condition` for backwards compatibility. TODO: Remove in v2
          bucket.size,
        ),
        bucket.key,
      ])
    const keys = buckets.map(({ key }) => key)

    return async (data, state) => {
      if (revFromState(state)) {
        return setFn(
          extractArrayFromBuckets(data, keys, options.nonvalues),
          state,
        )
      } else {
        return sortIntoBuckets(getFn, pipelines, data, state)
      }
    }
  }
}

export default transformer
