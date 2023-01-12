import mapAny = require('map-any')
import { Operands, Path, DataMapper, Options } from '../types'
import { unescapeValue } from '../utils/escape'
import { getRootFromState } from '../utils/stateHelpers'
import { defsToDataMapper } from '../utils/definitionHelpers'

interface Comparer {
  (value: unknown, match: unknown): boolean
}

interface NumericComparer {
  (value: number, match: number): boolean
}

interface CompareOperands extends Operands {
  path?: Path
  operator?: string
  match?: unknown
  matchPath?: Path
  not?: boolean
}

const not = (comparer: Comparer) => (value: unknown, match: unknown) =>
  !comparer(value, match)

const compareArrayOrValue =
  (comparer: Comparer) => (value: unknown, match: unknown) =>
    Array.isArray(value)
      ? value.some((value: unknown) => comparer(value, match))
      : comparer(value, match)

const isNumeric = (value: unknown): value is number => typeof value === 'number'

const compareArrayOrValueNumeric = (comparer: NumericComparer) =>
  compareArrayOrValue(
    (value: unknown, match: unknown) =>
      isNumeric(value) && isNumeric(match) && comparer(value, match)
  )

const compareEqual = compareArrayOrValue(
  (value: unknown, match: unknown) => value === match
)

const compareIn = (value: unknown, match: unknown) =>
  Array.isArray(match)
    ? match.some((item) => compareEqual(value, item))
    : compareEqual(value, match)

const exists = (value: unknown) => value !== undefined

function createComparer(operator: string) {
  switch (operator) {
    case '=':
      return compareEqual
    case '!=':
      return not(compareEqual)
    case '>':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value > match
      )
    case '>=':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value >= match
      )
    case '<':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value < match
      )
    case '<=':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value <= match
      )
    case 'in':
      return compareIn
    case 'exists':
      return exists
    default:
      return (_value: unknown, _match: unknown) => false
  }
}

export default function compare(
  {
    path = '.',
    operator = '=',
    match,
    matchPath,
    not = false,
  }: CompareOperands,
  _options: Options = {}
): DataMapper {
  const getValue = defsToDataMapper(path)
  const useRoot =
    typeof matchPath === 'string' &&
    matchPath[0] === '^' &&
    matchPath[1] !== '.'
  const realMatchPath = useRoot
    ? matchPath.slice(matchPath[1] === '^' ? 2 : 1)
    : matchPath
  const realMatchValue = mapAny(unescapeValue, match)
  const getMatch =
    typeof realMatchPath === 'string'
      ? defsToDataMapper(realMatchPath)
      : () => realMatchValue
  const comparer = createComparer(operator)

  return (data, state) => {
    const value = getValue(data)
    const match = getMatch(useRoot ? getRootFromState(state) : data)
    const result = comparer(value, match)
    return not ? !result : result
  }
}
