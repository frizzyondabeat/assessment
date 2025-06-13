### Building and running your application locally

When you're ready, start your application by running:
`docker compose up --build`.

Your application will be available at http://localhost:3000.

### Production Deployment

This project includes a production-ready Docker Compose configuration in `docker-compose.prod.yml` with the following features:

- Uses pre-built images from GitHub Container Registry
- Includes health checks for reliability monitoring
- Sets resource limits to prevent container overload
- Configures automatic restart for improved uptime
- Optimized for production environments

#### Manual Deployment

To manually deploy using the production configuration:

1. Pull the latest image from GitHub Container Registry:
   ```bash
   docker pull ghcr.io/[your-username]/assessment:latest
   ```

2. Create an `.env` file with the image tag:
   ```bash
   echo "IMAGE_TAG=ghcr.io/[your-username]/assessment:latest" > .env
   ```

3. Deploy using the production Docker Compose file:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

#### Automated Image Building with GitHub Actions

The project includes a CD workflow in `.github/workflows/cd.yml` that automatically:

1. Builds the Docker image when changes are pushed to the main branch
2. Pushes the image to GitHub Container Registry with appropriate tags

To use this workflow, you need to ensure your repository has the necessary permissions to write packages.

For deployment, you'll need to manually pull the image and deploy it using the steps in the Manual Deployment section above.

#### Custom Deployment

If you need to build and push the image manually:

```bash
# Build for your current architecture
docker build -t myregistry.com/myapp .

# Or build for a specific platform
docker build --platform=linux/amd64 -t myregistry.com/myapp .

# Push to your registry
docker push myregistry.com/myapp
```

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
