pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        AWS_REGION      = 'ap-south-1'
        AWS_ACCOUNT_ID  = '323708468873'
        ECR_REGISTRY    = '323708468873.dkr.ecr.ap-south-1.amazonaws.com'
        API_REPO        = 'automated-platform-api'
        WORKER_REPO     = 'automated-platform-worker'
        EKS_CLUSTER     = 'automated-platform'
        K8S_NAMESPACE   = 'platform'
        MANIFEST_DIR    = 'k8s/EKS'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify AWS and EKS Access') {
            steps {
                sh '''
                    set -e

                    aws sts get-caller-identity

                    aws eks update-kubeconfig \
                      --region "$AWS_REGION" \
                      --name "$EKS_CLUSTER"

                    kubectl get nodes
                    kubectl get namespace "$K8S_NAMESPACE" \
                      --ignore-not-found
                '''
            }
        }

        stage('Build API Image') {
            steps {
                sh '''
                    set -e

                    docker build \
                      -t "$ECR_REGISTRY/$API_REPO:$BUILD_NUMBER" \
                      ./mock-app/api
                '''
            }
        }

        stage('Build Worker Image') {
            steps {
                sh '''
                    set -e

                    docker build \
                      -t "$ECR_REGISTRY/$WORKER_REPO:$BUILD_NUMBER" \
                      ./mock-app/worker
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -e

                    aws ecr get-login-password \
                      --region "$AWS_REGION" |
                    docker login \
                      --username AWS \
                      --password-stdin "$ECR_REGISTRY"
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -e

                    docker push "$ECR_REGISTRY/$API_REPO:$BUILD_NUMBER"
                    docker push "$ECR_REGISTRY/$WORKER_REPO:$BUILD_NUMBER"
                '''
            }
        }

        stage('Deploy Platform Dependencies') {
            steps {
                sh '''
                    set -e

                    echo "Checking manifest files..."

                    test -f "$MANIFEST_DIR/namespace.yaml"
                    test -f "$MANIFEST_DIR/config.yaml"
                    test -f "$MANIFEST_DIR/redis.yaml"
                    test -f "$MANIFEST_DIR/postgres.yaml"

                    echo "Creating namespace and configuration..."
                    kubectl apply -f "$MANIFEST_DIR/namespace.yaml"
                    kubectl apply -f "$MANIFEST_DIR/config.yaml"

                    echo "Checking PostgreSQL credentials Secret..."
                    kubectl get secret postgres-credentials \
                      -n "$K8S_NAMESPACE"

                    echo "Creating or updating Redis..."
                    kubectl apply -f "$MANIFEST_DIR/redis.yaml"

                    echo "Creating or updating PostgreSQL..."
                    kubectl apply -f "$MANIFEST_DIR/postgres.yaml"

                    echo "Waiting for Redis..."
                    kubectl rollout status deployment/redis \
                      -n "$K8S_NAMESPACE" --timeout=180s

                    echo "Waiting for PostgreSQL..."
                    kubectl rollout status deployment/postgres \
                      -n "$K8S_NAMESPACE" --timeout=180s
                '''
            }
        }

        stage('Deploy API to EKS') {
            steps {
                sh '''
                    set -e

                    test -f "$MANIFEST_DIR/api.yaml"

                    API_MANIFEST="$WORKSPACE/api-rendered.yaml"

                    sed -E \
                      "s|image: .*automated-platform-api:[^[:space:]]+|image: $ECR_REGISTRY/$API_REPO:$BUILD_NUMBER|" \
                      "$MANIFEST_DIR/api.yaml" > "$API_MANIFEST"

                    echo "Applying API manifest..."
                    kubectl apply -f "$API_MANIFEST"

                    echo "Waiting for API rollout..."
                    kubectl rollout status deployment/api \
                      -n "$K8S_NAMESPACE" --timeout=180s
                '''
            }
        }

        stage('Deploy Worker to EKS') {
            steps {
                sh '''
                    set -e

                    test -f "$MANIFEST_DIR/worker.yaml"

                    WORKER_MANIFEST="$WORKSPACE/worker-rendered.yaml"

                    sed -E \
                      "s|image: .*automated-platform-worker:[^[:space:]]+|image: $ECR_REGISTRY/$WORKER_REPO:$BUILD_NUMBER|" \
                      "$MANIFEST_DIR/worker.yaml" > "$WORKER_MANIFEST"

                    echo "Applying worker manifest..."
                    kubectl apply -f "$WORKER_MANIFEST"
                    kubectl apply -f "$MANIFEST_DIR/api-hpa.yaml"

                    echo "Waiting for worker rollout..."
                    kubectl rollout status deployment/worker \
                      -n "$K8S_NAMESPACE" --timeout=180s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    echo "Checking deployments..."
                    kubectl get deployments -n "$K8S_NAMESPACE"

                    echo "Checking pods..."
                    kubectl get pods -n "$K8S_NAMESPACE"

                    echo "Checking services..."
                    kubectl get services -n "$K8S_NAMESPACE"

                    echo "Checking API health..."
                    kubectl run api-health-check \
                      -n "$K8S_NAMESPACE" \
                      --image=curlimages/curl:8.12.1 \
                      --restart=Never \
                      --rm -i \
                      --command -- \
                      curl --fail --retry 5 --retry-delay 2 \
                      http://api:8080/healthz

                    echo "Deployment verification completed."
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the stage error in Console Output.'
        }
    }
}