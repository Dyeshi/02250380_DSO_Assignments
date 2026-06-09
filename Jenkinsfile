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
                dir('todo-app/backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('todo-app/backend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('todo-app/backend') {
                    bat 'npm test'
                }
            }
            post {
                always {
                    junit testResults: 'todo-app/backend/junit.xml', allowEmptyResults: true
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def image = docker.build('dyeshi/be-todo:latest', 'todo-app/backend')

                    docker.withRegistry(
                        'https://index.docker.io/v1/',
                        'docker-hub-creds'
                    ) {
                        image.push('latest')
                        image.push('build-${env.BUILD_NUMBER}')
                    }
                }
            }
        }
    }
}