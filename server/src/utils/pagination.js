/**
 * Parse and clamp pagination query params coming from untrusted clients.
 * @param {unknown} pageRaw
 * @param {unknown} limitRaw
 * @param {{maxLimit?: number, defaultLimit?: number}} [opts]
 */
export function parsePagination(pageRaw, limitRaw, opts = {}) {
  const { maxLimit = 100, defaultLimit = 20 } = opts

  let page = parseInt(pageRaw, 10)
  if (!Number.isFinite(page) || page < 1) page = 1

  let limit = parseInt(limitRaw, 10)
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit
  if (limit > maxLimit) limit = maxLimit

  return { page, limit, skip: (page - 1) * limit }
}
