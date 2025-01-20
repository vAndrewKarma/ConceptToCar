
$PROJECT_ID = "ferrous-kayak-447111-i4"
$REGION = "europe-west1"
$ZONE = "europe-west1-b"
$CLUSTER_NAME = "conceptocar"
$MANIFESTS_PATH = "..\release\kubernetes-manifests.yaml"


function Handle-Error {
    param([string]$message)
    Write-Host $message
    Pause
    exit 1
}

Write-Host "Checking gcloud authentication..."


$authResult = gcloud auth list --quiet

if ($authResult -eq $null) {
    Write-Host "No account authenticated. Please authenticate using gcloud login."
    Write-Host "Use the following command if using a service account:"
    Write-Host "gcloud auth activate-service-account --key-file=path/to/your-service-account-key.json"
    Pause
    exit
}


Write-Host "Setting the active account..."
$activeAccount = "karma.andrew16@gmail.com"
gcloud config set account $activeAccount --quiet

if ($?) {
    Write-Host "Active account '$activeAccount' set successfully."
} else {
    Handle-Error "Failed to set active account. Exiting..."
}

Write-Host "Setting project, region, and zone..."
gcloud config set project $PROJECT_ID --quiet
if ($?) {
    Write-Host "Project '$PROJECT_ID' set successfully."
} else {
    Handle-Error "Failed to set project. Exiting..."
}

gcloud config set compute/zone $ZONE --quiet
if ($?) {
    Write-Host "Zone '$ZONE' set successfully."
} else {
    Handle-Error "Failed to set compute zone. Exiting..."
}

gcloud config set compute/region $REGION --quiet
if ($?) {
    Write-Host "Region '$REGION' set successfully."
} else {
    Handle-Error "Failed to set compute region. Exiting..."
}


Write-Host "Checking if GKE cluster $CLUSTER_NAME exists..."

$clusterExist = gcloud container clusters describe $CLUSTER_NAME --region $REGION --quiet 2>&1

if ($clusterExist -like "*Not found*") {
    Write-Host "Cluster '$CLUSTER_NAME' does not exist. Creating GKE cluster..."

gcloud container clusters create $CLUSTER_NAME --region=europe-west1 `
    --num-nodes=2 `
    --machine-type=e2-medium `
    --enable-autoscaling --min-nodes=2 --max-nodes=4 `
    --enable-network-policy `
    --enable-ip-alias `
    --enable-autorepair `
    --enable-autoupgrade `
    --quiet `
    --disk-type=pd-standard



    if ($?) {
        Write-Host "Cluster '$CLUSTER_NAME' created successfully."
    } else {
        Handle-Error "Failed to create cluster '$CLUSTER_NAME'. Exiting..."
    }
} else {
    Write-Host "Cluster '$CLUSTER_NAME' already exists."
}

Write-Host "Getting Kubernetes credentials for the cluster $CLUSTER_NAME..."
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION --project $PROJECT_ID --quiet

if ($?) {
    Write-Host "Kubernetes credentials acquired successfully."
} else {
    Handle-Error "Failed to acquire Kubernetes credentials. Exiting..."
}

Write-Host "Creating namespaces if they do not exist..."
kubectl create namespace deployments 2>&1 | Out-Null

if ($?) {
    Write-Host "Namespace 'deployments' created successfully."
} else {
    Write-Host "Namespace 'deployments' already exists."
}



kubectl create namespace databases 2>&1 | Out-Null

if ($?) {
    Write-Host "Namespace 'databases' created successfully."
} else {
    Write-Host "Namespace 'databases' already exists."
}



Write-Host "Creating RabbitMQ cookie secret..."
kubectl create secret generic rabbitmq-cookie-secret `
  --namespace=default `
  --from-literal=RABBITMQ_ERLANG_COOKIE='jlkgdfuirekreskldsecret23'

Write-Host "Creating AuthService secrets..."
kubectl create secret generic authservice-secrets `
  --namespace=deployments `
  --from-literal=PORT=50051 `
  --from-literal=MONGO_DB="mongodb://auth-mongo-srv.databases.svc.cluster.local:27017/authenthication" `
  --from-literal=REDIS_HOST="redis-service.default.svc.cluster.local" `
  --from-literal=REDIS_PORT=6379 `
  --from-literal=RABBITMQ_URL="amqp://rabbitmq-service.default.svc.cluster.local:5672"

Write-Host "Applying Kubernetes manifests from $MANIFESTS_PATH..."
kubectl apply -f $MANIFESTS_PATH

if ($?) {
    Write-Host "Kubernetes manifests applied successfully."
} else {
    Handle-Error "Failed to apply Kubernetes manifests. Exiting..."
}

Write-Host "Deployment process is complete!"
Pause
```