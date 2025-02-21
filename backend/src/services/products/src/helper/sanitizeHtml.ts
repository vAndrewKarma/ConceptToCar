import sanitizeHtmlz from 'sanitize-html'

function sanitizeHTML(str) {
  const d = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  return sanitizeHtmlz(d)
}
export default sanitizeHTML
