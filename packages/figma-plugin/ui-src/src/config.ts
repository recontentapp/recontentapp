export const getAppURL = () => {
  if (import.meta.env.PROD) {
    return 'https://app.recontent.app'
  }

  return 'http://localhost:3001'
}

export const getAPIBaseEndpoint = () => {
  if (import.meta.env.PROD) {
    return 'https://api.recontent.app/figma'
  }

  return 'http://localhost:3000/figma'
}
