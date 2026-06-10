02250380_DSO_Assignments
DSO101 — Continuous Integration and Continuous Deployment (CI/CD)
Student: Yeshi Lhendup
Student ID: 02250380
Bachelor of Engineering in Software Engineering (SWE)
Assignment Report
Introduction

This project was completed as part of the DSO101 module on Continuous Integration and Continuous Deployment (CI/CD). The objective of the assignments was to develop, containerize, automate, and deploy a full-stack To-Do List application using modern DevOps practices and tools.

The project involved three major assignments:

Docker containerization and cloud deployment
Jenkins CI/CD pipeline automation
GitHub Actions CI/CD with automated cloud deployment

The application consists of:

A React frontend
A Node.js and Express backend
A PostgreSQL database

The assignments focused on understanding DevOps workflows, automation, deployment pipelines, containerization, and cloud hosting.

Assignment 1 — Docker Containerization and Render Deployment
Objective

The objective of this assignment was to build and deploy a full-stack To-Do List application using Docker containers and Render.com cloud hosting.

Tools and Technologies Used
Tool	Purpose
Node.js & Express	Backend API development
React	Frontend user interface
PostgreSQL	Database management
Docker	Application containerization
DockerHub	Container image registry
Render.com	Cloud deployment platform
Implementation Process
Step 1 — Development of the To-Do Application

A full-stack To-Do List application was created with the following features:

Create tasks
View tasks
Update tasks
Delete tasks

The backend API was developed using Node.js and Express. PostgreSQL was used as the database for storing task information. The frontend interface was developed using React.

Environment variables were configured using files to securely manage database credentials and API URLs..env

Step 2 — Docker Containerization

The backend application was containerized using Docker. A Dockerfile was created to define the environment and dependencies required for the application.

Example Dockerfile:

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

Docker helped ensure consistency between development and deployment environments.

Step 3 — Docker Image Build and Push

The Docker image was built locally and pushed to DockerHub using the following commands:

docker build -t dyeshi/be-todo:02250380 .
docker push dyeshi/be-todo:02250380

This allowed the application image to be stored remotely and deployed from any environment.

Step 4 — Deployment on Render.com

The application was deployed on Render.com using DockerHub images.

The deployment process included:

Creating a Render Web Service
Creating a managed PostgreSQL database
Configuring environment variables
Setting up deployment configuration using render.yaml

The deployed application successfully connected to the PostgreSQL database hosted on Render.

Challenges Faced
Environment Variable Configuration

Initially, there was confusion between local configuration and cloud environment variables on Render. The application failed to connect properly until the variables were correctly configured on the Render dashboard..env

Frontend and Backend Communication

The frontend initially failed to communicate with the backend because the API URL was incorrect. This issue was fixed by properly setting the frontend environment variable with the deployed backend URL.

Learning Outcomes

Through this assignment, the following concepts were learned:

Docker containerization
Docker image management
Cloud deployment using Render
Environment variable management
Full-stack application deployment
Multi-service deployment configuration
Assignment 2 — Jenkins CI/CD Pipeline
Objective

The objective of this assignment was to automate the build, testing, and deployment process using Jenkins CI/CD pipelines.

Tools and Technologies Used
Tool	Purpose
Jenkins	CI/CD automation
GitHub	Source code repository
Node.js & npm	Runtime environment
There is	Unit testing
Docker	Containerization
DockerHub	Image hosting
Implementation Process
Step 1 — Jenkins Installation and Configuration

Jenkins was installed locally and configured with required plugins:

NodeJS Plugin
Pipeline Plugin
GitHub Integration Plugin
Docker Pipeline Plugin

Node.js tools were configured under Jenkins global tool configuration.

Step 2 — Credential Configuration

GitHub and DockerHub credentials were securely stored inside Jenkins.

The following credentials were configured:

GitHub Personal Access Token
DockerHub Access Token

These credentials were used during automated pipeline execution.

Step 3 — Jenkins Pipeline Creation

A declarative Jenkins pipeline was created using a .Jenkinsfile

The pipeline stages included:

Source code checkout
Dependency installation
Application build
Automated testing
Docker image deployment

Example pipeline structure:

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
        }

        stage('Deploy') {
            steps {
                script {
                    def image = docker.build('dyeshi/be-todo:latest', 'todo-app/backend')

                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        image.push('latest')
                        image.push("build-${env.BUILD_NUMBER}")
                    }
                }
            }
        }
    }
}
Step 4 — Pipeline Execution

The Jenkins pipeline was connected to the GitHub repository and executed successfully.

Each build automatically:

Pulled the latest code
Installed dependencies
Ran tests
Built Docker images
Pushed images to DockerHub
Challenges Faced
DockerHub Authentication Failure

The initial pipeline failed because DockerHub passwords are no longer accepted for CLI authentication. The issue was solved using DockerHub Personal Access Tokens.

Incorrect Docker Registry URL

The pipeline initially used the wrong Docker registry URL. Updating the registry endpoint fixed the authentication issue.

Incorrect:

https://registry.hub.docker.com

Correct:

https://index.docker.io/v1/
Groovy String Interpolation Issue

The Docker image tagging initially failed because single quotes prevented variable interpolation.

Incorrect:

'image.push('build-${env.BUILD_NUMBER}')'

Correct:

image.push("build-${env.BUILD_NUMBER}")
Learning Outcomes

This assignment provided practical experience in:

Jenkins setup and configuration
Declarative pipeline development
CI/CD automation
Docker image deployment automation
Secure credential management
Automated testing integration
Assignment 3 — GitHub Actions CI/CD with Render Deployment
Objective

The objective of this assignment was to automate Docker image building, DockerHub deployment, and Render redeployment using GitHub Actions.

Tools and Technologies Used
Tool	Purpose
GitHub Actions	CI/CD automation
Docker	Containerization
DockerHub	Container registry
Render.com	Cloud hosting
PostgreSQL	Database
Node.js	Backend runtime
There is	Testing framework
Implementation Process
Step 1 — Dockerfile Update

The Dockerfile was updated to use Node.js 20 Alpine image.

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
Step 2 — Database Configuration for Render

The database connection configuration was updated to support Render’s PostgreSQL service using .DATABASE_URL

Updated database configuration:

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

SSL support was required for successful database communication.

Step 3 — GitHub Actions Workflow Creation

A GitHub Actions workflow file was created under ..github/workflows/main.yml

Workflow process:

Checkout repository
Login to DockerHub
Build Docker image
Push image to DockerHub
Trigger Render deployment

Example workflow:

name: Build and Deploy

on:
  push:
    branches: ["main"]

jobs:
  build-and-deploy:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/be-todo:latest ./todo-app/backend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/be-todo:latest

      - name: Trigger Render Deployment
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_WEBHOOK }}
Step 4 — GitHub Secrets Configuration

The following secrets were configured in GitHub:

DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
RENDER_DEPLOY_WEBHOOK

These secrets ensured secure CI/CD operations.

Step 5 — Automated Deployment

Once code was pushed to the branch:main

GitHub Actions automatically triggered
Docker images were built and pushed
Render deployment webhook was triggered
The latest application version was deployed automatically
Challenges Faced
ECONNREFUSED Database Error

The application initially failed on Render due to incorrect PostgreSQL configuration. The issue was fixed by switching from individual database variables to .DATABASE_URL

SSL Requirement on Render

Database connections failed until SSL support was enabled in the PostgreSQL configuration.

Missing Deployment Webhook

The first workflow execution failed because the deploy webhook secret was empty. Adding the correct webhook URL fixed the issue.

Learning Outcomes

This assignment helped develop understanding of:

GitHub Actions workflows
Automated deployment pipelines
Secret management
Docker automation
Cloud deployment workflows
Continuous Deployment strategies
Live Deployment
Service	URL
Backend API	https://be-todo-latest-yi2n.onrender.com
DockerHub Repository	https://hub.docker.com/r/dyeshi/be-todo
Conclusion

This project provided practical experience with modern DevOps tools and workflows. Through the three assignments, a complete CI/CD pipeline was successfully implemented for a full-stack application.

The project demonstrated:

Docker containerization
Cloud deployment
Jenkins automation
GitHub Actions workflows
Automated testing and deployment
Secure secret management
Continuous Integration and Continuous Deployment practices

The assignments strengthened understanding of real-world software deployment pipelines and DevOps automation processes widely used in industry environments today.

![alt text](<Screenshot 2026-06-09 180505 copy.png>) ![alt text](<Screenshot 2026-06-09 180505.png>) ![alt text](<Screenshot 2026-06-09 180558 copy.png>) ![alt text](<Screenshot 2026-06-09 180558.png>) ![alt text](<Screenshot 2026-06-09 180642 copy.png>) ![alt text](<Screenshot 2026-06-09 180642.png>) ![alt text](<Screenshot 2026-06-09 180645 copy.png>) ![alt text](<Screenshot 2026-06-09 180645.png>) ![alt text](<Screenshot 2026-06-09 182038 copy.png>) ![alt text](<Screenshot 2026-06-09 182038.png>) ![alt text](<Screenshot 2026-06-09 182746 copy.png>) ![alt text](<Screenshot 2026-06-09 182746.png>) ![alt text](<Screenshot 2026-06-09 182839 copy.png>) ![alt text](<Screenshot 2026-06-09 182839.png>) ![alt text](<Screenshot 2026-06-09 182946 copy.png>) ![alt text](<Screenshot 2026-06-09 182946.png>) ![alt text](<Screenshot 2026-06-09 183024 copy.png>) ![alt text](<Screenshot 2026-06-09 183024.png>) ![alt text](<Screenshot 2026-06-09 183116 copy.png>) ![alt text](<Screenshot 2026-06-09 183116.png>) ![alt text](<Screenshot 2026-06-09 183522 copy.png>) ![alt text](<Screenshot 2026-06-09 183522.png>) ![alt text](<Screenshot 2026-06-09 184416 copy.png>) ![alt text](<Screenshot 2026-06-09 184416.png>) ![alt text](<Screenshot 2026-06-09 184609 copy.png>) ![alt text](<Screenshot 2026-06-09 184609.png>) ![alt text](<Screenshot 2026-06-09 212205 copy.png>) ![alt text](<Screenshot 2026-06-09 212205.png>) ![alt text](<Screenshot 2026-06-09 212321 copy.png>) ![alt text](<Screenshot 2026-06-09 212321.png>) ![alt text](<Screenshot 2026-06-09 212628 copy.png>) ![alt text](<Screenshot 2026-06-09 212628.png>) ![alt text](<Screenshot 2026-06-09 212801 copy.png>) ![alt text](<Screenshot 2026-06-09 212801.png>) ![alt text](<Screenshot 2026-06-09 214121 copy.png>) ![alt text](<Screenshot 2026-06-09 214121.png>) ![alt text](<Screenshot 2026-06-09 214245 copy.png>) ![alt text](<Screenshot 2026-06-09 214245.png>) ![alt text](<Screenshot 2026-06-09 214529 copy.png>) ![alt text](<Screenshot 2026-06-09 214529.png>) ![alt text](<Screenshot 2026-06-09 221437 copy.png>) ![alt text](<Screenshot 2026-06-09 221437.png>) ![alt text](<Screenshot 2026-06-09 221516 copy.png>) ![alt text](<Screenshot 2026-06-09 221516.png>) ![alt text](<Screenshot 2026-06-09 221558 copy.png>) ![alt text](<Screenshot 2026-06-09 221558.png>) ![alt text](<Screenshot 2026-06-09 221654 copy.png>) ![alt text](<Screenshot 2026-06-09 221654.png>) ![alt text](<Screenshot 2026-06-09 225908 copy.png>) ![alt text](<Screenshot 2026-06-09 225908.png>) ![alt text](<Screenshot 2026-06-10 003608 copy.png>) ![alt text](<Screenshot 2026-06-10 003608.png>) ![alt text](<Screenshot 2026-06-10 013230 copy.png>) ![alt text](<Screenshot 2026-06-10 013230.png>) ![alt text](<Screenshot 2026-06-10 013432 copy.png>) ![alt text](<Screenshot 2026-06-10 013432.png>) ![alt text](<Screenshot 2026-06-10 013506 copy.png>) ![alt text](<Screenshot 2026-06-10 013506.png>) ![alt text](<Screenshot 2026-06-10 013626 copy.png>) ![alt text](<Screenshot 2026-06-10 013626.png>) ![alt text](<Screenshot 2026-06-10 013638 copy.png>) ![alt text](<Screenshot 2026-06-10 013638.png>) ![alt text](<Screenshot 2026-06-10 014235 copy.png>) ![alt text](<Screenshot 2026-06-10 014235.png>) ![alt text](<Screenshot 2026-06-10 014532 copy.png>) ![alt text](<Screenshot 2026-06-10 014532.png>) ![alt text](<Screenshot 2026-06-10 014542 copy.png>) ![alt text](<Screenshot 2026-06-10 014542.png>) ![alt text](<Screenshot 2026-06-10 014600 copy.png>) ![alt text](<Screenshot 2026-06-10 014600.png>) ![alt text](<Screenshot 2026-06-10 014630 copy.png>) ![alt text](<Screenshot 2026-06-10 014630.png>) ![alt text](<Screenshot 2026-06-10 014646 copy.png>) ![alt text](<Screenshot 2026-06-10 014646.png>) ![alt text](<Screenshot 2026-06-10 014933 copy.png>) ![alt text](<Screenshot 2026-06-10 014933.png>)