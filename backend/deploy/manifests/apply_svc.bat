kubectl apply -f authservice/authenservice-service.yaml
kubectl apply -f authservice/authentservice-deployment.yaml
kubectl apply -f keyservice/keyservice-deployment.yaml
kubectl apply -f keyservice/keyservice-service.yaml
kubectl apply -f productservice/productservice-deployment.yaml
kubectl apply -f productservice/productservice-service.yaml