import { createHash } from 'crypto'
export default function verifyPKCE(
  codeVerifier: string,
  codeChallenge: string
): boolean {
  const hash = createHash('sha256').update(codeVerifier).digest('base64')

  const computedChallenge = hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return codeChallenge === computedChallenge
}
