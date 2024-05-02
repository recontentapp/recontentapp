export const escape = (cellContent: string) => {
  /**
   * Avoid Excel from interpreting the content
   * as a formula for security reasons
   */
  if (/^[=+@-]/.test(cellContent)) {
    return `'${cellContent}`
  }

  return cellContent
}
