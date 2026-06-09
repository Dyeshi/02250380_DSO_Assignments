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
                    junit 'todo-app/backend/junit.xml'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    dir('todo-app/backend') {
                        docker.build('dyeshi/be-todo:latest')

                        docker.withRegistry(
                            'https://registry.hub.docker.com',
                            'docker-hub-creds'
                        ) {
                            docker.image('dyeshi/be-todo:latest').push()
                        }
                    }
                }
            }
        }
    }
}