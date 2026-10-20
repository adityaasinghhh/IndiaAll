import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCsv } from '../src/utils/csv.js'
import { parsePagination } from '../src/utils/pagination.js'
import { escapeRegExp, searchFilter } from '../src/utils/search.js'
import { isValidEmail, isValidPhone, sanitizeString } from '../src/utils/validators.js'

test('buildCsv quotes fields, doubles inner quotes, and terminates with CRLF', () => {
  const csv = buildCsv(['A', 'B'], [['plain', 'has, comma'], ['quote"inside', 'line\nbreak']])
  const lines = csv.trim().split('\r\n')
  assert.equal(lines.length, 3)
  assert.equal(lines[0], '"A","B"')
  assert.equal(lines[1], '"plain","has, comma"')
  assert.equal(lines[2], '"quote""inside","line\nbreak"')
})

test('buildCsv neutralises spreadsheet formula injection', () => {
  const csv = buildCsv(['Name'], [['=1+1'], ['+123'], ['-2'], ['@SUM(A1)'], ['=1+1']])
  const lines = csv.trim().split('\r\n')
  assert.equal(lines[1], '"\'=1+1"')
  assert.equal(lines[2], '"\'+123"')
  assert.equal(lines[3], '"\'-2"')
  assert.equal(lines[4], '"\'@SUM(A1)"')
})

test('parsePagination clamps hostile input', () => {
  assert.deepEqual(parsePagination('1', '20'), { page: 1, limit: 20, skip: 0 })
  assert.deepEqual(parsePagination('-5', '99999'), { page: 1, limit: 100, skip: 0 })
  assert.deepEqual(parsePagination('abc', 'xyz'), { page: 1, limit: 20, skip: 0 })
  assert.deepEqual(parsePagination('3', '10'), { page: 3, limit: 10, skip: 20 })
})

test('escapeRegExp and searchFilter make search input safe', () => {
  assert.equal(escapeRegExp('(a.*b)'), '\\(a\\.\\*b\\)')
  const filter = searchFilter('(test)', ['name', 'company'])
  assert.ok(filter.$or[0].name instanceof RegExp)
  // The generated regex must not throw and must literally match the term.
  assert.ok(filter.$or[0].name.test('(test)'))
  assert.ok(searchFilter('', ['name']) === undefined)
  assert.ok(searchFilter('   ', ['name']) === undefined)
})

test('validators behave as expected', () => {
  assert.equal(isValidEmail('user@example.com'), true)
  assert.equal(isValidEmail('not-an-email'), false)
  assert.equal(isValidEmail('a@b'), false)
  assert.equal(isValidPhone('+55 11 99999 9999'), true)
  assert.equal(isValidPhone('abc'), false)
  assert.equal(sanitizeString('<script>alert(1)</script>'), 'scriptalert(1)/script')
  assert.equal(sanitizeString(123), '')
  assert.equal(sanitizeString('  hi  '), 'hi')
})
