import { CustomOrigin } from '../../../shared-types'

export const isValidCustomOrigin = (origin: string) => {
  try {
    const url = new URL(origin)
    return url.origin === origin
  } catch (e) {
    return false
  }
}

const defaultURLs = {
  api: 'https://api.recontent.app/api/figma-plugin',
  app: 'https://app.recontent.app',
}

export const getURLs = (origin: CustomOrigin) => {
  if (!origin) {
    return defaultURLs
  }

  const isValid = isValidCustomOrigin(origin)

  if (!isValid) {
    return defaultURLs
  }

  return {
    api: `${origin}/api/figma-plugin`,
    app: origin,
  }
}
