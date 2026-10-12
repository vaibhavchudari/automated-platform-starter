
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
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build API Image') {
            steps {
                sh '''
                    docker build \
                      -t ${ECR_REGISTRY}/${API_REPO}:${BUILD_NUMBER} \
                      ./mock-app/api
                '''
            }
        }

        stage('Build Worker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${ECR_REGISTRY}/${WORKER_REPO}:${BUILD_NUMBER} \
                      ./mock-app/worker
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
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
                    docker push ${ECR_REGISTRY}/${API_REPO}:${BUILD_NUMBER}
                    docker push ${ECR_REGISTRY}/${WORKER_REPO}:${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Both images were pushed to ECR.'
        }
        failure {
            echo 'FAILED: Check Console Output for the error.'
        }
    }
}
