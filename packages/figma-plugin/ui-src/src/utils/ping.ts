interface PingParams {
  apiKey: string
  customBaseUrl?: string
}

interface PingResult {
  isValid: boolean
  name: string
}

export const ping = async ({
  apiKey,
  customBaseUrl,
}: PingParams): Promise<PingResult> => {
  const baseUrl = customBaseUrl || 'https://api.recontent.app'
  const response = await fetch(`${baseUrl}/figma-plugin/Ping`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then(res => res.json())
    .catch(() => null)

  if (!response) {
    return { isValid: false, name: '' }
  }

  if (!('name' in response)) {
    return { isValid: false, name: '' }
  }

  return { isValid: true, name: response.name }
}
