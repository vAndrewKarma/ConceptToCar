export default async function removeOldTokensFromSet(redis, setKey, pattern) {
  let cursor = '0'
  do {
    const [nextCursor, members] = await redis.sscan(
      setKey,
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100
    )

    if (members.length > 0) {
      await redis.srem(setKey, ...members)
    }

    cursor = nextCursor
  } while (cursor !== '0')
}
