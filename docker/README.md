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

| Name                           | Description                               |
| ------------------------------ | ----------------------------------------- |
| `DATABASE_URL`                 | Postgres connection string                |
| `DATABASE_LOG_QUERIES`         | Log SQL queries                           |
| `JWT_SECRET`                   | [JWT](https://jwt.io/) for authentication |
| `MAILER_HOST`                  | Mailer config                             |
| `MAILER_PORT`                  | Mailer config                             |
| `MAILER_SECURE`                | Mailer config                             |
| `MAILER_USER`                  | Mailer config                             |
| `MAILER_PASSWORD`              | Mailer config                             |
| `MAILER_FROM_EMAIL`            | Email address used to send emails         |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Bypass mailer security checks             |
| `SERVE_STATIC_FILES`           | Wether or not web app should be served    |
| `APP_URL`                      | Base URL for webapp                       |
| `API_URL`                      | Base URL for API                          |

## Migrate environment variables

| Name           | Description                |
| -------------- | -------------------------- |
| `DATABASE_URL` | Postgres connection string |
