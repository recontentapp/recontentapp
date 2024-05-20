import { CustomOrigin } from '../../../shared-types'

const isValidCustomOrigin = (origin: string) => {
  try {
    const url = new URL(origin)
    return url.origin === origin
  } catch (e) {
    return false
  }
}

const defaultURLs = {
  api: 'https://api.recontent.app/figma-plugin',
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
    api: `${origin}/figma-plugin`,
    app: origin,
  }
}
