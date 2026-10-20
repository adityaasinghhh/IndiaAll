/**
 * Escape user input before it is embedded in a RegExp, so search queries
 * containing regex metacharacters (e.g. "foo(", "a.*b") cannot throw or
 * alter the query semantics.
 */
export function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build a case-insensitive "contains" Mongo filter for a set of fields.
 * Returns undefined when the search term is empty.
 * @param {string} search
 * @param {string[]} fields
 */
export function searchFilter(search, fields) {
  if (!search || typeof search !== 'string') return undefined

  const term = search.trim()
  if (!term) return undefined

  const rx = new RegExp(escapeRegExp(term), 'i')
  return { $or: fields.map((field) => ({ [field]: rx })) }
}
