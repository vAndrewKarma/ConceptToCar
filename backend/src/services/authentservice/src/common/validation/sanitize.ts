export default function sanitize(v) {
  if (v instanceof Object) {
    for (const key in v) {
      if (/^\$/.test(key)) {
        delete v[key]
      } else {
        sanitize(v[key])
      }
    }
  }
  return v
}
