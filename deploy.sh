#!/bin/bash
set -e


CLUSTER_NAME="opschat-local"
FRONTEND_IMAGE="opschat-frontend"
BACKEND_IMAGE="opschat-backend"
TAG="v1"  

echo "🚀 Starting Local Deployment Pipeline..."

# 1. Build Docker Images
echo "📦 Building Docker Images..."
docker build --network=host -t $BACKEND_IMAGE:$TAG ./opschat-backend
docker build --network=host -t $FRONTEND_IMAGE:$TAG ./opschat-frontend

# 2. Load Images into Kind
echo "🚚 Loading images into Kind cluster..."
kind load docker-image $BACKEND_IMAGE:$TAG --name $CLUSTER_NAME
kind load docker-image $FRONTEND_IMAGE:$TAG --name $CLUSTER_NAME

# 3. Apply Kubernetes Manifests
echo "📄 Applying Kubernetes Manifests..."
kubectl apply -f k8s/

# 4. Force Restart

echo "🔄 Restarting Deployments to pick up new code..."
kubectl rollout restart deployment backend
kubectl rollout restart deployment frontend

# 5. Wait for Rollout
echo "⏳ Waiting for rollout to finish..."
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend

echo "✅ Deployment Complete! App is live at http://localhost:8000"