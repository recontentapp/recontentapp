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

const getDistribution = (): 'cloud' | 'self-hosted' => {
  if (process.env.APP_DISTRIBUTION === 'cloud') {
    return 'cloud'
  }

  return 'self-hosted'
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
      distribution: getDistribution(),
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
      app: String(process.env.APP_URL),
      api: String(process.env.API_URL),
    },
    security: {
      jwtSecret: String(process.env.JWT_SECRET),
      encryptionKey: String(process.env.ENCRYPTION_KEY),
    },
    googleOAuth: {
      available:
        !!process.env.GOOGLE_OAUTH_CLIENT_ID &&
        !!process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
        !!process.env.GOOGLE_OAUTH_REDIRECT_URL,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_OAUTH_REDIRECT_URL,
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
      openAIKey: process.env.OPENAI_API_KEY,
    },
    worker: {
      available: !!process.env.SQS_QUEUE_URL,
      sqsQueueUrl: String(process.env.SQS_QUEUE_URL),
    },
    billing: {
      stripeKey: process.env.STRIPE_API_KEY,
      stripeWebhookSigningSecret: process.env.STRIPE_WEBHOOK_SIGNING_SECRET,
      stripeTestClockId: process.env.STRIPE_TEST_CLOCK_ID,
      cloudWatchLogsGroupName: process.env.CLOUDWATCH_LOGS_BILLING_GROUP_NAME,
      cloudWatchLogsStreamName: process.env.CLOUDWATCH_LOGS_BILLING_STREAM_NAME,
    },
    slack: {
      notificationsWebhookUrl: process.env.SLACK_NOTIFICATIONS_WEBHOOK_URL,
      feedbacksWebhookUrl: process.env.SLACK_FEEDBACKS_WEBHOOK_URL,
    },
    githubApp: {
      available:
        !!process.env.GITHUB_APP_ID &&
        !!process.env.GITHUB_APP_PRIVATE_KEY &&
        !!process.env.GITHUB_APP_CLIENT_ID &&
        !!process.env.GITHUB_APP_CLIENT_SECRET &&
        !!process.env.GITHUB_APP_WEBHOOK_SECRET,
      appId: Number(process.env.GITHUB_APP_ID),
      appName: String(process.env.GITHUB_APP_NAME),
      privateKey: String(process.env.GITHUB_APP_PRIVATE_KEY),
      clientId: String(process.env.GITHUB_APP_CLIENT_ID),
      clientSecret: String(process.env.GITHUB_APP_CLIENT_SECRET),
      webhookSecret: String(process.env.GITHUB_APP_WEBHOOK_SECRET),
    },
  }
}

export default getConfig

export type Config = ReturnType<typeof getConfig>
