```bash
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx create --name mybuilder --driver docker-container --bootstrap
docker buildx use mybuilder

docker buildx build --platform linux/arm64,linux/amd64 -t joehe/grafana:8.1.4-j06 --push .

docker build -t joehe/grafana:8.1.4-j06 .
```
