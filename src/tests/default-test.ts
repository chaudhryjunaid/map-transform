import test from 'ava'
import { get } from '../funcs/getSet'

import { mapTransform, alt, value } from '..'

test('should use default value', (t) => {
  const def = {
    title: [
      'content.heading',
      alt(value('Default heading'))
    ]
  }
  const data = [
    { content: {} },
    { content: { heading: 'From data' } }
  ]
  const expected = [
    { title: 'Default heading' },
    { title: 'From data' }
  ]

  const ret = mapTransform(def)(data)

  t.deepEqual(ret, expected)
})

test('should use default value in array', (t) => {
  const def = {
    id: [
      'id',
      alt(get('key'))
    ]
  }
  const data = [
    { id: 'id1', key: 'key1' },
    { key: 'key2' }
  ]
  const expected = [
    { id: 'id1' },
    { id: 'key2' }
  ]

  const ret = mapTransform(def)(data)

  t.deepEqual(ret, expected)
})

test('should set missing values to undefined when no default', (t) => {
  const def = {
    title: 'content.heading'
  }
  const data = [
    { content: {} },
    { content: { heading: 'From data' } }
  ]
  const expected = [
    { title: undefined },
    { title: 'From data' }
  ]

  const ret = mapTransform(def)(data)

  t.deepEqual(ret, expected)
})

test.skip('should use defaultRev value', (t) => {
  const def = {
    mapping: {
      title: {
        path: 'content.heading',
        default: 'Wrong way',
        defaultRev: 'Default heading'
      }
    }
  }
  const data = [
    {},
    { title: 'From data' }
  ]
  const expected = [
    { content: { heading: 'Default heading' } },
    { content: { heading: 'From data' } }
  ]

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test.skip('should set missing value to undefined when no defaultRev', (t) => {
  const def = {
    mapping: {
      title: {
        path: 'content.heading'
      }
    }
  }
  const data = [
    {},
    { title: 'From data' }
  ]
  const expected = [
    { content: { heading: undefined } },
    { content: { heading: 'From data' } }
  ]

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test.skip('should not use default values', (t) => {
  const def = {
    mapping: {
      title: {
        path: 'content.heading',
        default: 'Default heading',
        defaultRev: 'Wrong way'
      }
    }
  }
  const data = [
    { content: {} },
    { content: { heading: 'From data' } }
  ]
  const expected = [
    {},
    { title: 'From data' }
  ]

  const ret = mapTransform(def)(data) // .noDefaults(data)

  t.deepEqual(ret, expected)
})

test.skip('should not set missing prop to undefined', (t) => {
  const def = {
    mapping: {
      title: 'content.heading'
    }
  }
  const data = [
    { content: {} },
    { content: { heading: 'From data' } }
  ]
  const expected = [
    {},
    { title: 'From data' }
  ]

  const ret = mapTransform(def)(data) // .noDefaults

  t.deepEqual(ret, expected)
})

test.skip('should not use default values on rev', (t) => {
  const def = {
    mapping: {
      title: {
        path: 'content.heading',
        default: 'Wrong way',
        defaultRev: 'Default heading'
      }
    }
  }
  const data = [
    {},
    { title: 'From data' }
  ]
  const expected = [
    {},
    { content: { heading: 'From data' } }
  ]

  const ret = mapTransform(def).rev(data) // .noDefaults

  t.deepEqual(ret, expected)
})
