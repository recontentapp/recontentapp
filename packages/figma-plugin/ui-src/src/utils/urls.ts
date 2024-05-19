export const isValidFigmaURL = (
  url: string,
): { isValid: boolean; key: string } => {
  const regex =
    /https:\/\/[\w\\.-]+\.?figma.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/i

  if (!regex.test(url)) {
    return { isValid: false, key: '' }
  }

  const result = regex.exec(url) ?? []

  return {
    isValid: true,
    key: result[2],
  }
}
