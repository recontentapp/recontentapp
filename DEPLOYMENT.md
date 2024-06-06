# Deploying Recontent.app

Recontent.app is meant to be deployed directly to a remote environment. If you want to run Recontent.app locally, check out the [`CONTRIBUTING.md`](https://github.com/recontentapp/recontentapp/blob/master/CONTRIBUTING.md) guide.

## Requirements

- A Postgres database (13 or above)
- An environment that supports Docker applications

## Setting up the database

Recontent.app uses [Prisma](https://prisma.io/) to manage its DB schema & migrations. A `recontentapp-migrate` docker image is available to migrate an existing Recontent.app database or a fresh one.

```sh
# Pull Docker image
docker pull recontentapp/recontentapp-migrate:0.4.3

# Run migrations against database
docker run --env DATABASE_URL="postgres://postgres:postgres@host.docker.internal:6033/recontentapp" recontentapp/recontentapp-migrate:0.4.3
```

If your database is accessible from the Internet, these commands can be run from your computer by making sure the `DATABASE_URL` environment variable is correct. For more advanced contexts, this Docker image can be used to spawn a container on each deployment or app restart.

> [!NOTE]
> On Apple Silicon processors, you might need to use `export DOCKER_DEFAULT_PLATFORM=linux/amd64`

## Running the app

Apart from its database, Recontent.app is packaged as a single Docker image that can be executed on Cloud services like AWS ECS, Digital Ocean or Google Cloud Platform.

```sh
# Pull Docker image
docker pull recontentapp/recontentapp:0.4.3

# Run container
docker run -p 127.0.0.1:8080:8080/tcp --env DATABASE_URL="postgres://postgres:postgres@host.docker.internal:6033/recontentapp" recontentapp/recontentapp:0.4.3
```

### Environment variables

Here's the full list of environment variables that need to be passed to the application container to run successfully.

| Name                              | Description                                              | Required |
| --------------------------------- | -------------------------------------------------------- | -------- |
| `WORKSPACE_INVITE_ONLY`           | Disable sign up after first registration                 | `false`  |
| `PORT`                            | Port on which app runs                                   | `true`   |
| `DATABASE_URL`                    | Postgres connection string                               | `true`   |
| `DATABASE_LOG_QUERIES`            | Log SQL queries                                          | `false`  |
| `JWT_SECRET`                      | [JWT](https://jwt.io/) for authentication                | `true`   |
| `ENCRYPTION_KEY`                  | Encrypt/decrypt credentials stored in database           | `true`   |
| `SQS_QUEUE_URL`                   | AWS SQS queue to use for jobs                            | `false`  |
| `GOOGLE_OAUTH_CLIENT_ID`          | Google OAuth2 application config for Google sign-in      | `false`  |
| `GOOGLE_OAUTH_CLIENT_SECRET`      | Google OAuth2 application config for Google sign-in      | `false`  |
| `GOOGLE_OAUTH_REDIRECT_URL`       | Google OAuth2 application config for Google sign-in      | `false`  |
| `MAILER_HOST`                     | Mailer config                                            | `true`   |
| `MAILER_PORT`                     | Mailer config                                            | `true`   |
| `MAILER_SECURE`                   | Mailer config                                            | `false`  |
| `MAILER_USER`                     | Mailer config                                            | `false`  |
| `MAILER_PASSWORD`                 | Mailer config                                            | `false`  |
| `MAILER_FROM_EMAIL`               | Email address used to send emails                        | `true`   |
| `SERVE_STATIC_FILES`              | Wether or not web app should be served                   | `false`  |
| `APP_URL`                         | Base URL for webapp                                      | `true`   |
| `API_URL`                         | Base URL for API                                         | `true`   |
| `S3_REGION`                       | Region for S3-compatible object storage                  | `false`  |
| `S3_ENDPOINT`                     | Endpoint URL for S3-compatible object storage            | `false`  |
| `S3_ACCESS_KEY_ID`                | Credentials for S3-compatible object storage             | `false`  |
| `S3_SECRET_ACCESS_KEY`            | Credentials for S3-compatible object storage             | `false`  |
| `S3_BUCKET_NAME`                  | Bucket name in which CDN assets are stored               | `false`  |
| `S3_BUCKET_URL`                   | Public base URL for bucket objects                       | `false`  |
| `AUTO_TRANSLATE_PROVIDER`         | Service used for machine translations. `aws` or `openai` | `false`  |
| `OPENAI_API_KEY`                  | OpenAI API key for ChatGPT completions                   | `false`  |
| `AWS_ACCESS_KEY_ID`               | AWS credentials if AWS Translate is used                 | `false`  |
| `AWS_SECRET_ACCESS_KEY`           | AWS credentials if AWS Translate is used                 | `false`  |
| `AWS_REGION`                      | AWS setting if AWS Translate is used                     | `false`  |
| `SLACK_NOTIFICATIONS_WEBHOOK_URL` | Slack webhook to receive notifications                   | `false`  |
| `SLACK_FEEDBACKS_WEBHOOK_URL`     | Slack webhook to receive notifications                   | `false`  |

`APP_URL` & `API_URL` are usually the same. For example, if Recontent.app is hosted at `recontent.my-app.com`, `https://recontent.my-app.com` can be used for both environment variables.

You can choose to disable workspace creation on your Recontent.app instance. Once the first user signs up & creates a first workspace, it's no longer possible to create a new one for new users.

### Google sign-in with Google OAuth2 application

Recontent.app supports logging in users using Google accounts through OAuth2.

To set it up, follow the next steps:

- Create a project on Google Cloud Console
- Go to "APIs & Services"
- Click "OAuth consent screen" & set it up based on your needs (internal or external)
- Click "Add or remove scopes" & add the following ones:
  - `userinfo.email`
  - `userinfo.profile`
- Click "Credentials" > "Create credentials"
  - Select "OAuth client ID"
  - Select "Web application" as application type
  - Add authorized JavaScript origins based on your Recontent.app instance
    - `https://recontent.my-app.com`
  - Add authorized redirect URIs based on your Recontent.app instance
    - `https://recontent.my-app.com/sign-in`
- Copy the generated client ID, client secret & redirect URI to pass them as environment variables

### Auto translation with AWS Translate or OpenAI

Recontent.app supports auto-translating phrases once a translation is available in at least one language for a given phrase. Auto translation can either be powered by [AWS Translate](https://aws.amazon.com/translate/) or [OpenAI](https://platform.openai.com/).

### Worker with AWS SQS queue

Recontent.app sometimes needs to perform tasks (eg. daily destinations sync) on a regular basis (eg. CRON jobs) which do not fit the request/response model. To ensure these tasks can be performed at scale, an AWS SQS queue is used for batch processing.

You can set up this worker by using the `SQS_QUEUE_URL` environment variable.

#### Using AWS Translate

The AWS Translate SDK is initialized using [standard AWS credentials retrieval mechanisms](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html).

Make sure `AUTO_TRANSLATE_PROVIDER` is set to `aws` & credentials are provided in one of the listed ways & that the AWS managed policy `TranslateReadOnly` or the following policy is used:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "translate:TranslateText",
        "translate:TranslateDocument",
        "translate:GetTerminology",
        "translate:ListTerminologies",
        "translate:ListTextTranslationJobs",
        "translate:DescribeTextTranslationJob",
        "translate:GetParallelData",
        "translate:ListParallelData",
        "comprehend:DetectDominantLanguage",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

#### Using OpenAI

OpenAI ChatGPT requests are authenticated using a standard API key. Make sure to pass the `OPENAI_API_KEY` environment variable & set `AUTO_TRANSLATE_PROVIDER` to `openai`.

### CDN with S3-compatible object storage

Recontent.app has a built-in destination type called CDN which allows users to expose their translations on public URLs using various formats like JSON.

An S3-compatible object storage bucket (AWS S3, Cloudflare R2) is used to store generated files, which can then be accessed publicly behind AWS CloudFront for example.

The environment variable `S3_BUCKET_NAME` is used to indicate which bucket to use & `S3_BUCKET_URL` defines the base URL for bucket objects. For example, if your S3 bucket points to `translations-cdn.my-app.com`, `https://translations-cdn.my-app.com` should be used.

The AWS S3 SDK is initialized using [standard AWS credentials retrieval mechanisms](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html).

Make sure credentials are provided in one of the listed ways & that the following policy is used:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:*"],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

## Deploying on Cloud providers

### Digital Ocean

**Create a new project**

**Create a new database**

- Go to Manage > Databases
- Click "Create database"
- Choose a datacenter region
- Select "PostgreSQL" as database engine
- Update database configuration based on your needs
- Click "Create Database Cluster"

**Start a `recontentapp-migrate` docker container as described in ["Setting up the database"](#setting-up-the-database)**

- Make sure to use the connection string available on the database page

**Create a new app**

- Go to Manage > App Platform
- Click "Create App"
- Select "GitHub Container Registry" as service provider
- Enter "recontentapp/recontentapp" as Repository
- Enter "0.4.3" as Image tag
- Click "Next"
- Ensure "Web Service" is selected as Resource Type
- Click "Next"
- Add environment variables as described in ["Environment variables"](#environment-variables)
  - Make sure to add `PORT` `8080`
- Click "Next"
- Review info & click "Next"
- Once the app is started & its public URL has been generated, make sure to edit the `APP_URL` & `API_URL` environment variables. For example, if `clownfish-app-zbfol` is the name of your app, `https://clownfish-app-zbfol.ondigitalocean.app` should be used.
