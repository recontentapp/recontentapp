# Building Docker images

Here are a few code snippets used during development to test Docker images.

Make sure to add necessary environment variables as described in the the [`DEPLOYMENT.md`](https://github.com/recontentapp/recontentapp/blob/master/DEPLOYMENT.md) guide.

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
docker run --env-file ./packages/api/.env -p 3000:3000 recontentapp:latest
```
