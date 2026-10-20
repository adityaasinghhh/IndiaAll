/**
 * CSV generation helpers.
 *
 * - Fields are wrapped in double quotes and inner quotes are doubled (RFC 4180).
 * - Formula injection is neutralised: cells beginning with = + - @ (or control
 *   chars like \t \r) are prefixed with a single quote so spreadsheet
 *   applications treat them as plain text. Customer-supplied values must never
 *   be interpreted as formulas.
 */

const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r']

function escapeCell(value) {
  if (value === null || value === undefined) return ''

  let cell = String(value)

  if (FORMULA_TRIGGERS.includes(cell[0] || '')) {
    cell = `'${cell}`
  }

  return `"${cell.replace(/"/g, '""')}"`
}

/**
 * Build a CSV string from a header row and data rows.
 * @param {string[]} headers
 * @param {Array<Array<unknown>>} rows
 */
export function buildCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','))
  }
  // CRLF line endings for maximum spreadsheet compatibility.
  return `${lines.join('\r\n')}\r\n`
}

/**
 * Stream a Mongoose cursor-like iterable to the client as a CSV download.
 * Only permitted fields are exported — callers explicitly list the fields.
 */
export function sendCsv(res, headers, rows, filename) {
  const csv = buildCsv(headers, rows)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(csv)
}
