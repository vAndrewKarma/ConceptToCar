export default async function deleteOldTokens(redis, pattern) {
  let cursor = '0'
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100
    )
    if (keys.length > 0) await redis.del(...keys)
    cursor = nextCursor
  } while (cursor !== '0')
}
