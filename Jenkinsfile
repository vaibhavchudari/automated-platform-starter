
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build API Image') {
            steps {
                sh 'docker build -t platform-api:${BUILD_NUMBER} ./mock-app/api'
            }
        }

        stage('Build Worker Image') {
            steps {
                sh 'docker build -t platform-worker:${BUILD_NUMBER} ./mock-app/worker'
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh 'docker images'
                sh 'docker image inspect platform-api:${BUILD_NUMBER}'
                sh 'docker image inspect platform-worker:${BUILD_NUMBER}'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: API and Worker Docker images built successfully.'
        }

        failure {
            echo 'FAILED: Check the Jenkins console output for errors.'
        }
    }
}
