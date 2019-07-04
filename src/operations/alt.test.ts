import test from 'ava'
import { DataMapper } from '../types'

import alt from './alt'

// Helpers

const getUser: DataMapper = data => (data ? (data as any).user : undefined)

const options = {}

// Tests

test('should set alt value when value is undefined', t => {
  const state = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: undefined
  }
  const expected = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: 'johnf'
  }

  const ret = alt(getUser)(options)(state)

  t.deepEqual(ret, expected)
})

test('should do nothing when value is set', t => {
  const state = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: 'maryk'
  }
  const expected = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: 'maryk'
  }

  const ret = alt(getUser)(options)(state)

  t.deepEqual(ret, expected)
})

test('should treat string as path', t => {
  const state = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: undefined
  }
  const expected = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: 'johnf'
  }

  const ret = alt('user')(options)(state)

  t.deepEqual(ret, expected)
})

test('should treat array as map pipe', t => {
  const state = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: undefined
  }
  const expected = {
    root: { user: 'johnf' },
    context: { user: 'johnf' },
    value: 'johnf'
  }

  const ret = alt(['user'])(options)(state)

  t.deepEqual(ret, expected)
})
