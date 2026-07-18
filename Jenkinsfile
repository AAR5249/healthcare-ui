pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_PREFIX = 'medibook'
        DOCKER_CREDENTIALS_ID = 'docker-credentials'
        KUBE_CONFIG = 'kubeconfig'

        // Service versions
        GATEWAY_VERSION = "${env.BUILD_NUMBER}"
        AUTH_VERSION = "${env.BUILD_NUMBER}"
        APPOINTMENT_VERSION = "${env.BUILD_NUMBER}"
        NOTIFICATION_VERSION = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
                sh 'git fetch --tags'
            }
            post {
                success {
                    echo 'Checkout successful'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies for all services...'
                sh '''
                    # Install shared packages
                    cd shared/packages/types && npm install
                    cd ../../../shared/packages/utils && npm install
                    cd ../../../shared/packages/middleware && npm install

                    # Install services
                    cd gateway && npm install
                    cd ../auth-service && npm install
                    cd ../appointment-service && npm install
                    cd ../notification-service && npm install
                '''
            }
        }

        stage('Lint') {
            steps {
                echo 'Running linter for all services...'
                sh '''
                    cd gateway && npm run lint
                    cd ../auth-service && npm run lint
                    cd ../appointment-service && npm run lint
                    cd ../notification-service && npm run lint
                '''
            }
            post {
                failure {
                    echo 'Linting failed. Please fix the issues.'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests for all services...'
                sh '''
                    cd shared/packages/types && npm run build 2>/dev/null || true
                    cd ../../../shared/packages/utils && npm run build 2>/dev/null || true
                    cd ../../../shared/packages/middleware && npm run build 2>/dev/null || true

                    cd gateway && npm run test:coverage || true
                    cd ../auth-service && npm run test:coverage || true
                    cd ../appointment-service && npm run test:coverage || true
                    cd ../notification-service && npm run test:coverage || true
                '''
            }
            post {
                always {
                    // Publish test results
                    junit allowEmptyResults: true, testResults: '**/junit.xml'

                    // Publish coverage reports
                    publishCoverage adapters: [
                        jacocoAdapter(
                            path: '**/coverage/lcov.info',
                            mergeToOneReport: true
                        )
                    ], sourceFileResolver: sourceFiles('NEVER_STORE')
                }
                failure {
                    echo 'Some tests failed. Please check the test reports.'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                script {
                    // Build Gateway
                    docker.build("${DOCKER_IMAGE_PREFIX}/gateway:${GATEWAY_VERSION}", "./gateway")

                    // Build Auth Service
                    docker.build("${DOCKER_IMAGE_PREFIX}/auth-service:${AUTH_VERSION}", "./auth-service")

                    // Build Appointment Service
                    docker.build("${DOCKER_IMAGE_PREFIX}/appointment-service:${APPOINTMENT_VERSION}", "./appointment-service")

                    // Build Notification Service
                    docker.build("${DOCKER_IMAGE_PREFIX}/notification-service:${NOTIFICATION_VERSION}", "./notification-service")
                }
            }
        }

        stage('Push to Registry') {
            steps {
                echo 'Pushing Docker images to registry...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS_ID) {
                        sh """
                            docker tag ${DOCKER_IMAGE_PREFIX}/gateway:${GATEWAY_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/gateway:${GATEWAY_VERSION}
                            docker tag ${DOCKER_IMAGE_PREFIX}/gateway:${GATEWAY_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/gateway:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/gateway:${GATEWAY_VERSION}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/gateway:latest

                            docker tag ${DOCKER_IMAGE_PREFIX}/auth-service:${AUTH_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/auth-service:${AUTH_VERSION}
                            docker tag ${DOCKER_IMAGE_PREFIX}/auth-service:${AUTH_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/auth-service:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/auth-service:${AUTH_VERSION}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/auth-service:latest

                            docker tag ${DOCKER_IMAGE_PREFIX}/appointment-service:${APPOINTMENT_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/appointment-service:${APPOINTMENT_VERSION}
                            docker tag ${DOCKER_IMAGE_PREFIX}/appointment-service:${APPOINTMENT_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/appointment-service:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/appointment-service:${APPOINTMENT_VERSION}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/appointment-service:latest

                            docker tag ${DOCKER_IMAGE_PREFIX}/notification-service:${NOTIFICATION_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/notification-service:${NOTIFICATION_VERSION}
                            docker tag ${DOCKER_IMAGE_PREFIX}/notification-service:${NOTIFICATION_VERSION} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/notification-service:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/notification-service:${NOTIFICATION_VERSION}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/notification-service:latest
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to Kubernetes...'
                withCredentials([kubeconfig(credentialsId: KUBE_CONFIG, variable: 'KUBECONFIG')]) {
                    sh '''
                        cd k8s
                        chmod +x deploy.sh
                        ./deploy.sh medibook
                    '''
                }
            }
            post {
                success {
                    echo 'Deployment successful!'
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Running health checks...'
                sh '''
                    sleep 30
                    kubectl get pods -n medibook
                    kubectl get services -n medibook
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            // Send notification
            script {
                emailext(
                    subject: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <p>Build ${env.BUILD_NUMBER} of ${env.JOB_NAME} completed successfully!</p>
                        <p>Changes: ${env.CHANGE_SET?.getLogs()}??join(', ')}</p>
                        <p>Build URL: ${env.BUILD_URL}</p>
                    """,
                    to: 'team@medibook.com',
                    mimeType: 'text/html'
                )
            }
        }

        failure {
            echo 'Pipeline failed!'
            // Send failure notification
            script {
                emailext(
                    subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <p>Build ${env.BUILD_NUMBER} of ${env.JOB_NAME} failed!</p>
                        <p>Please check the build logs: ${env.BUILD_URL}</p>
                    """,
                    to: 'team@medibook.com',
                    mimeType: 'text/html'
                )
            }
        }

        cleanup {
            echo 'Cleaning up...'
            sh 'docker system prune -f'
        }
    }
}
