docker buildx build --platform linux/amd64,linux/arm64 . -t wdoyle123/portfolio-website:1.2.4 --push --no-cache

cd manifests

kubectl delete -f .
kubectl apply -f .


