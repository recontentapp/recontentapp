const requiredEnvVars = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'MAILER_HOST',
  'MAILER_PORT',
  'MAILER_FROM_EMAIL',
  'APP_URL',
  'API_URL',
]

const getAutoTranslateProvider = (): 'aws' | 'openai' | null => {
  const requestedProvider = process.env.AUTO_TRANSLATE_PROVIDER

  if (requestedProvider === 'aws') {
    return 'aws'
  }

  if (requestedProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return 'openai'
  }

  return null
}

const getConfig = () => {
  /**
   * Check if all required environment variables are set
   * Used to prevent the application from starting with missing configuration
   * & have proper typing for the configuration object
   */
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable "${envVar}" is required`)
    }
  }

  return {
    app: {
      version: process.env.APP_VERSION ?? '0.0.0',
      distribution: process.env.APP_DISTRIBUTION ?? 'self-hosted',
      workspaceInviteOnly: process.env.WORKSPACE_INVITE_ONLY === 'true',
      serveStaticFiles: process.env.SERVE_STATIC_FILES === 'true',
    },
    database: {
      url: String(process.env.DATABASE_URL),
      logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
    },
    mailer: {
      host: String(process.env.MAILER_HOST),
      port: parseInt(process.env.MAILER_PORT ?? '1025', 10),
      secure: process.env.MAILER_SECURE === 'true',
      user: process.env.MAILER_USER,
      password: process.env.MAILER_PASSWORD,
      fromEmail: String(process.env.MAILER_FROM_EMAIL),
    },
    urls: {
      app: process.env.APP_URL,
      api: process.env.API_URL,
    },
    security: {
      jwtSecret: String(process.env.JWT_SECRET),
      encryptionKey: String(process.env.ENCRYPTION_KEY),
      nodeTlsRejectUnauthorized: parseInt(
        process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? '1',
        10,
      ),
    },
    cdn: {
      available:
        !!process.env.S3_REGION &&
        !!process.env.S3_ENDPOINT &&
        !!process.env.S3_ACCESS_KEY_ID &&
        !!process.env.S3_SECRET_ACCESS_KEY &&
        !!process.env.S3_BUCKET_NAME &&
        !!process.env.S3_BUCKET_URL,
      region: String(process.env.S3_REGION),
      endpoint: String(process.env.S3_ENDPOINT),
      accessKeyId: String(process.env.S3_ACCESS_KEY_ID),
      secretAccessKey: String(process.env.S3_SECRET_ACCESS_KEY),
      bucketName: String(process.env.S3_BUCKET_NAME),
      bucketUrl: String(process.env.S3_BUCKET_URL),
    },
    autoTranslate: {
      provider: getAutoTranslateProvider(),
    },
    openAIKey: process.env.OPENAI_API_KEY,
  }
}

export default getConfig

export type Config = ReturnType<typeof getConfig>
