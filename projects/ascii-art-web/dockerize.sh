#!/bin/bash

# Build the Docker image
echo -e "Building Docker image..."
docker image build -f Dockerfile -t ascii-art-web-docker .

# Show images
echo -e "\n Current Docker images:"
docker images

# Run the container
echo -e "\n Running Docker container..."
# Stop and remove existing container if it exists
if docker ps -a -q -f name=dockerize | grep -q .; then
    echo "Stopping and removing existing container..."
    docker container stop dockerize 2>/dev/null || true
    docker container rm dockerize 2>/dev/null || true
fi
docker container run -p 8080:8080 --detach --name dockerize ascii-art-web-docker

# Show containers
echo -e "\n Current Docker containers:"
docker ps -a

# Clean up dangling images (only unused, not all)
echo -e "\n Cleaning up dangling images..."
docker image prune -f

echo "Done! Container is running on http://localhost:8080"
echo "          To stop the container, use:                 docker container stop dockerize"
echo "          To remove the container, use:               docker container rm dockerize"
echo "          To clean up everything afterwards, use:     docker system prune -a --volumes"