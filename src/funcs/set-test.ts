import test from 'ava'

import { set } from './getSet'

// Tests

test('should set value on path', (t) => {
  const data = { user: 'johnf' }
  const state = {
    root: data,
    context: data,
    value: 'johnf'
  }
  const expected = {
    root: data,
    context: data,
    value: { meta: { author: 'johnf' } }
  }
  const ret = set('meta.author')(state)

  t.deepEqual(ret, expected)
})

test('should set undefined', (t) => {
  const state = {
    root: {},
    context: {},
    value: undefined
  }
  const expectedValue = { meta: { author: undefined } }

  const ret = set('meta.author')(state)

  t.deepEqual(ret.value, expectedValue)
})

test('should get from path when reverse mapping', (t) => {
  const data = { user: 'johnf' }
  const state = {
    root: data,
    context: data,
    value: { meta: { author: 'johnf' } },
    rev: true
  }
  const expected = {
    root: data,
    context: data,
    value: 'johnf',
    rev: true,
    arr: false
  }
  const ret = set('meta.author')(state)

  t.deepEqual(ret, expected)
})
