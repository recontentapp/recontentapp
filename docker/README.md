# Building Docker images

```sh
# Build app image
docker build . -f docker/Dockerfile -t recontentapp:latest --no-cache

# Build migrations image
docker build . -f docker/Dockerfile.migrate -t recontentapp-migrate:latest --no-cache

# Run bash within image to inspect content
docker run -it recontentapp:latest sh

# Get metadata about image
docker inspect recontentapp:latest

# Run migrate container locally to ensure it works
docker run --env DATABASE_URL=postgres://postgres:postgres@host.docker.internal:6033/recontentapp recontentapp-migrate:latest

# Run app container locally to ensure it works
docker run -p 127.0.0.1:8080:8080/tcp --env PORT=8080 --env JWT_SECRET=HelloWorld --env DATABASE_URL=postgres://postgres:postgres@host.docker.internal:6033/recontentapp --env SERVE_STATIC_FILES=true recontentapp:latest
```

## App environment variables

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
| `OPENAI_API_KEY`               | OpenAI API key for ChatGPT completions                   | `false`  |

## Migrate environment variables

| Name           | Description                | Required |
| -------------- | -------------------------- | -------- |
| `DATABASE_URL` | Postgres connection string | `true`   |
