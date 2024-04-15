# Deploying Recontent.app

Recontent.app is meant to be deployed directly to a remote environment. If you want to run Recontent.app locally, check out the [`CONTRIBUTING.md`](https://github.com/recontentapp/recontentapp/blob/master/CONTRIBUTING.md) guide.

## Requirements

- A Postgres database (13 or above)
- An environment that supports Docker applications

## Setting up the database

Recontent.app uses [Prisma](https://prisma.io/) to manage its DB schema & migrations. A `recontentapp-migrate` docker image is available to migrate an existing Recontent.app database or a fresh one.

```sh
# Pull Docker image
docker pull ghcr.io/recontentapp/recontentapp-migrate:0.1.0

# Run migrations against database
docker run --env DATABASE_URL=postgres://postgres:postgres@host.docker.internal:6033/recontentapp recontentapp-migrate:0.1.0
```

If your database is accessible from the Internet, these commands can be run from your computer by making sure the `DATABASE_URL` environment variable is correct. For more advanced contexts, this Docker image can be used to spawn a container on each deployment or app restart.

## Running the app

Apart from its database, Recontent.app is packaged as a single Docker image that can be executed on Cloud services like AWS ECS, Digital Ocean or Google Cloud Platform.

```sh
# Pull Docker image
docker pull ghcr.io/recontentapp/recontentapp:0.1.0

# Run container
docker run -p 127.0.0.1:8080:8080/tcp --env DATABASE_URL=postgres://postgres:postgres@host.docker.internal:6033/recontentapp recontentapp:0.1.0
```

### Environment variables

Here's the full list of environment variables that need to be passed to the application container to run successfully.

| Name                           | Description                                              | Required |
| ------------------------------ | -------------------------------------------------------- | -------- |
| `PORT`                         | Port on which app runs                                   | `true`   |
| `DATABASE_URL`                 | Postgres connection string                               | `true`   |
| `DATABASE_LOG_QUERIES`         | Log SQL queries                                          | `false`  |
| `JWT_SECRET`                   | [JWT](https://jwt.io/) for authentication                | `true`   |
| `MAILER_HOST`                  | Mailer config                                            | `true`   |
| `MAILER_PORT`                  | Mailer config                                            | `true`   |
| `MAILER_SECURE`                | Mailer config                                            | `false`  |
| `MAILER_USER`                  | Mailer config                                            | `false`  |
| `MAILER_PASSWORD`              | Mailer config                                            | `false`  |
| `MAILER_FROM_EMAIL`            | Email address used to send emails                        | `true`   |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Bypass mailer security checks                            | `false`  |
| `SERVE_STATIC_FILES`           | Wether or not web app should be served                   | `false`  |
| `APP_URL`                      | Base URL for webapp                                      | `true`   |
| `API_URL`                      | Base URL for API                                         | `true`   |
| `SIGN_UP_DISABLED`             | Disable sign up after first registration                 | `false`  |
| `AUTO_TRANSLATE_PROVIDER`      | Service used for machine translations. `aws` or `openai` | `false`  |
| `OPENAI_API_KEY`               | OpenAI API key for ChatGPT completions                   | `false`  

`APP_URL` & `API_URL` are usually the same. For example, if Recontent.app is hosted at `translations.my-app.com`, `https://translations.my-app.com` can be used for both environment variables.

You can choose to disable workspace creation on your Recontent.app instance. Once the first user signs up & creates a first workspace, it's no longer possible to create a new one for new users.

### Autotranslation with AWS Translate or OpenAI

TO DO

### CDN with AWS S3

TO DO
