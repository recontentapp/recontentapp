export const indexBy = <T>(
  items: T[],
  key: keyof T,
): Record<string, T | undefined> => {
  return items.reduce(
    (acc, item) => {
      acc[String(item[key])] = item
      return acc
    },
    {} as Record<string, T | undefined>,
  )
}
