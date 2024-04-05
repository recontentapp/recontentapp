const getConfig = () => ({
  app: {
    version: process.env.APP_VERSION ?? '0.0.0',
    distribution: process.env.APP_DISTRIBUTION ?? 'self-hosted',
    signUpDisabled: process.env.SIGN_UP_DISABLED === 'true',
    serveStaticFiles: process.env.SERVE_STATIC_FILES === 'true',
  },
  database: {
    url: process.env.DATABASE_URL,
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
  },
  mailer: {
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT ?? '1025', 10),
    secure: process.env.MAILER_SECURE === 'true',
    user: process.env.MAILER_USER,
    password: process.env.MAILER_PASSWORD,
    fromEmail: process.env.MAILER_FROM_EMAIL,
  },
  urls: {
    app: process.env.APP_URL,
    api: process.env.API_URL,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
    nodeTlsRejectUnauthorized: parseInt(
      process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? '1',
      10,
    ),
  },
  cdn: {
    bucket: process.env.AWS_S3_CDN_BUCKET,
    bucketUrl: process.env.AWS_S3_CDN_BUCKET_URL,
  },
})

export default getConfig

export type Config = ReturnType<typeof getConfig>
