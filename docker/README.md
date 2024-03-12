# Building Recontent.app using Docker

```sh
# Build image
docker build . -f docker/Dockerfile -t recontentapp:latest --no-cache

# Run bash within image to inspect content
docker run -it recontentapp:latest sh

# Get metadata about image
docker inspect recontentapp:latest

# Run container locally to ensure it works
docker run -p 127.0.0.1:8080:8080/tcp --env PORT=8080 --env JWT_SECRET=HelloWorld --env DATABASE_URL=postgres://postgres:postgres@host.docker.internal:6033/recontentapp --env SERVE_STATIC_FILES=true recontentapp:latest
```
