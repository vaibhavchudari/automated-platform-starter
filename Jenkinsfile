pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '323708468873'
        ECR_REGISTRY = '323708468873.dkr.ecr.ap-south-1.amazonaws.com'
        API_REPO = 'automated-platform-api'
        WORKER_REPO = 'automated-platform-worker'
        EKS_CLUSTER = 'automated-platform'
        K8S_NAMESPACE = 'platform'
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
                    kubectl get deployments -n "$K8S_NAMESPACE"
                '''
            }
        }

        stage('Build API Image') {
            steps {
                sh '''
                    set -e

                    docker build \
                      -t ${ECR_REGISTRY}/${API_REPO}:${BUILD_NUMBER} \
                      ./mock-app/api
                '''
            }
        }

        stage('Build Worker Image') {
            steps {
                sh '''
                    set -e

                    docker build \
                      -t ${ECR_REGISTRY}/${WORKER_REPO}:${BUILD_NUMBER} \
                      ./mock-app/worker
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -e

                    aws ecr get-login-password --region "$AWS_REGION" |
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

                    docker push ${ECR_REGISTRY}/${API_REPO}:${BUILD_NUMBER}
                    docker push ${ECR_REGISTRY}/${WORKER_REPO}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy API to EKS') {
            steps {
                sh '''
                    set -e

                    kubectl -n "$K8S_NAMESPACE" set image deployment/api \
                      api=${ECR_REGISTRY}/${API_REPO}:${BUILD_NUMBER}

                    kubectl -n "$K8S_NAMESPACE" rollout status deployment/api \
                      --timeout=180s
                '''
            }
        }

        stage('Deploy Worker to EKS') {
            steps {
                sh '''
                    set -e

                    kubectl -n "$K8S_NAMESPACE" set image deployment/worker \
                      worker=${ECR_REGISTRY}/${WORKER_REPO}:${BUILD_NUMBER}

                    kubectl -n "$K8S_NAMESPACE" rollout status deployment/worker \
                      --timeout=180s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    kubectl get deployments -n "$K8S_NAMESPACE"
                    kubectl get pods -n "$K8S_NAMESPACE"
                    kubectl get services -n "$K8S_NAMESPACE"
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Images built, pushed to ECR, and deployed to EKS.'
        }

        failure {
            echo 'FAILED: Check Console Output to identify the failed stage.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}