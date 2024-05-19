export const processPromisesInBatches = async <T>(
  promises: Promise<T>[],
  batchSize: number,
): Promise<PromiseSettledResult<Awaited<T>>[]> => {
  let results: PromiseSettledResult<Awaited<T>>[] = []

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(batch)
    results = [...results, ...batchResults]
  }

  return results
}
