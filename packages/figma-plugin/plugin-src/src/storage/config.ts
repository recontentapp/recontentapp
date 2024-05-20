import { UserConfig } from '../../../shared-types'

const USER_CONFIG_STORAGE_KEY = 'userConfig'

export const getUserConfig = async (): Promise<UserConfig | null> => {
  const config = await figma.clientStorage.getAsync(USER_CONFIG_STORAGE_KEY)

  if (!config) {
    return null
  }

  try {
    const parsedConfig = JSON.parse(config) as UserConfig
    return parsedConfig
  } catch (e) {
    return null
  }
}

export const setUserConfig = async (config: UserConfig | null) => {
  if (!config) {
    await figma.clientStorage.deleteAsync(USER_CONFIG_STORAGE_KEY)
    return
  }

  await figma.clientStorage.setAsync(
    USER_CONFIG_STORAGE_KEY,
    JSON.stringify(config),
  )
}
