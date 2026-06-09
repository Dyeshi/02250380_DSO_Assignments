pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Dyeshi/02250380_DSO_Assignments.git',
                    credentialsId: 'github-creds'
            }
        }

        stage('Install') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
            post {
                always {
                    junit 'backend/junit.xml'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    dir('backend') {
                        docker.build('dyeshi/be-todo:latest')
                        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                            docker.image('dyeshi/be-todo:latest').push()
                        }
                    }
                }
            }
        }
    }
}