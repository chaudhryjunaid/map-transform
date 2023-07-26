import type { TransformerProps, Transformer } from '../types.js'
import { defToDataMapper } from '../utils/definitionHelpers.js'

export interface Props extends TransformerProps {
  path?: string
}

const extractPath = (path: Props | string) =>
  typeof path === 'string' ? path : path.path

const transformer: Transformer<Props | string> = function get(props) {
  return (options) => {
    const path = extractPath(props) || '.'
    return defToDataMapper(path, options)
  }
}

export default transformer
