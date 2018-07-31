import test from 'ava'

import mapTransform = require('..')

test('should reverse map simple object', (t) => {
  const def = {
    mapping: {
      title: 'content.heading',
      author: 'meta.writer.username'
    }
  }
  const data = {
    title: 'The heading',
    author: 'johnf'
  }
  const expected = {
    content: { heading: 'The heading' },
    meta: { writer: { username: 'johnf' } }
  }

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map array of objects', (t) => {
  const def = {
    mapping: {
      title: 'content.heading',
      author: 'meta.writer.username'
    }
  }
  const data = [
    { title: 'The heading', author: 'johnf' },
    { title: 'Second heading', author: 'maryk' }
  ]
  const expected = [
    {
      content: { heading: 'The heading' },
      meta: { writer: { username: 'johnf' } }
    },
    {
      content: { heading: 'Second heading' },
      meta: { writer: { username: 'maryk' } }
    }
  ]

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map with array path', (t) => {
  const def = {
    mapping: {
      title: 'content.heading',
      author: 'meta.writer[0].username'
    }
  }
  const data = {
    title: 'The heading',
    author: 'johnf'
  }
  const expected = {
    content: { heading: 'The heading' },
    meta: { writer: [{ username: 'johnf' }] }
  }

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map with object path', (t) => {
  const def = {
    mapping: {
      title: { path: 'content.heading' }
    },
    path: 'content.articles'
  }
  const data = [
    { title: 'Heading 1' },
    { title: 'Heading 2' }
  ]
  const expected = {
    content: {
      articles: [
        { content: { heading: 'Heading 1' } },
        { content: { heading: 'Heading 2' } }
      ]
    }
  }

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map data as is when no mapping', (t) => {
  const def = {
    path: 'content'
  }
  const data = {
    title: 'The heading',
    author: 'johnf'
  }
  const expected = {
    content: {
      title: 'The heading',
      author: 'johnf'
    }
  }

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map with object pathTo', (t) => {
  const def = {
    mapping: {
      title: { path: 'content.heading' }
    },
    pathTo: 'content.articles'
  }
  const data = {
    content: {
      articles: [
        { title: 'Heading 1' },
        { title: 'Heading 2' }
      ]
    }
  }
  const expected = [
    { content: { heading: 'Heading 1' } },
    { content: { heading: 'Heading 2' } }
  ]

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map with object pathRev and pathToRev', (t) => {
  const def = {
    mapping: {
      title: { path: 'content.heading' }
    },
    path: 'wrong.path',
    pathRev: 'content.articles',
    pathTo: 'wrong.path',
    pathToRev: 'items'
  }
  const data = {
    items: [
      { title: 'Heading 1' },
      { title: 'Heading 2' }
    ]
  }
  const expected = {
    content: {
      articles: [
        { content: { heading: 'Heading 1' } },
        { content: { heading: 'Heading 2' } }
      ]
    }
  }

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should reverse map with empty pathRev and pathToRev', (t) => {
  const def = {
    mapping: {
      title: { path: 'content.heading' }
    },
    path: 'wrong.path',
    pathRev: null,
    pathTo: 'wrong.path',
    pathToRev: null
  }
  const data = [
    { title: 'Heading 1' },
    { title: 'Heading 2' }
  ]
  const expected = [
    { content: { heading: 'Heading 1' } },
    { content: { heading: 'Heading 2' } }
  ]

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should return data when no mapping def', (t) => {
  const def = null
  const data = [
    { content: { heading: 'Heading 1' } },
    { content: { heading: 'Heading 2' } }
  ]
  const expected = data

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})

test('should return data when mapping def is empty', (t) => {
  const def = {}
  const data = [
    { content: { heading: 'Heading 1' } },
    { content: { heading: 'Heading 2' } }
  ]
  const expected = data

  const ret = mapTransform(def).rev(data)

  t.deepEqual(ret, expected)
})
