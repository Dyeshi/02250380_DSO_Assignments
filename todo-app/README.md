# 02250380_DSO_Assignments
# DSO101 - Continuous Integration and Continuous Deployment
### Student: Yeshi Lhendup | Student ID: 02250380
### Bachelor of Engineering in Software Engineering (SWE)

---

## Repository Structure

```
02250380_DSO_Assignments/
├── todo-app/
│   ├── backend/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── server.test.js
│   └── frontend/
│       ├── Dockerfile
│       └── ...
├── .github/
│   └── workflows/
│       └── main.yml
├── Jenkinsfile
├── render.yaml
└── README.md
```

---

## Assignment 1 — Docker Containerization & Render Deployment

### Objective
Build and deploy a full-stack To-Do List application (Frontend, Backend, Database) using Docker and Render.com.

### Tools & Technologies
| Tool | Purpose |
|---|---|
| Node.js & Express | Backend runtime and API |
| React | Frontend UI |
| PostgreSQL | Database |
| Docker | Containerization |
| DockerHub | Container registry |
| Render.com | Cloud deployment |

### Steps Taken

**Step 1 — Built the To-Do Application**
- Created a Node.js/Express backend with full CRUD API (`/todos`)
- Created a React frontend with UI for adding, editing, and deleting tasks
- Used PostgreSQL for data persistence
- Configured environment variables using `.env` files for database credentials and API URLs
- Added `.env` to `.gitignore` to avoid committing secrets

**Step 2 — Dockerized the Application**

Backend `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 3 — Built and Pushed Docker Images to DockerHub**
```bash
docker build -t dyeshi/be-todo:02250380 .
docker push dyeshi/be-todo:02250380
```

**Step 4 — Deployed on Render.com**
- Created a Web Service on Render using the existing DockerHub image
- Created a managed PostgreSQL database on Render
- Configured environment variables (`DATABASE_URL`, `PORT`) on the Render dashboard
- Configured `render.yaml` for multi-service blueprint deployment

### Challenges Faced
- Understanding how environment variables work differently between local `.env` files and Render's dashboard configuration
- The frontend needed the correct backend URL set as `REACT_APP_API_URL` to communicate with the deployed backend

### Learning Outcomes
- How to containerize a Node.js application using Docker
- How to push and manage images on DockerHub
- How to deploy multi-service applications on Render.com using both manual image deployment and blueprint (`render.yaml`) configuration
- The importance of environment variables for managing configuration across environments

---

## Assignment 2 — Jenkins CI/CD Pipeline

### Objective
Configure a Jenkins pipeline to automate the build, test, and deployment of the To-Do application from Assignment 1.

### Tools & Technologies
| Tool | Purpose |
|---|---|
| Jenkins | CI/CD automation |
| GitHub | Source code hosting |
| Node.js & npm | Runtime and package management |
| Jest | Unit testing framework |
| Docker | Containerization and deployment |
| DockerHub | Container registry |

### Steps Taken

**Step 1 — Installed and Configured Jenkins**
- Downloaded and installed Jenkins on localhost:8080
- Installed required plugins: NodeJS Plugin, Pipeline, GitHub Integration, Docker Pipeline
- Configured Node.js under Manage Jenkins → Tools → NodeJS (v26.x)

**Step 2 — Set Up GitHub Credentials in Jenkins**
- Generated a GitHub Personal Access Token (PAT) with `repo` permissions
- Added credentials in Jenkins as `github-creds` (Username + PAT)
- Added DockerHub credentials as `docker-hub-creds` using a DockerHub Access Token (not password, as Docker Hub deprecated password-based CLI auth)

**Step 3 — Created the Jenkinsfile**

```groovy
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
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        image.push('latest')
                        image.push("build-${env.BUILD_NUMBER}")
                    }
                }
            }
        }
    }
}
```

**Step 4 — Ran the Pipeline**
- Created a new Pipeline item in Jenkins
- Set Pipeline definition to "Pipeline script from SCM" pointing to the GitHub repo
- Triggered builds and verified all stages passed

### Challenges Faced

**Challenge 1 — Docker Hub Authentication Failure**
The first build failed with `unauthorized: incorrect username or password`. Docker Hub no longer accepts account passwords for CLI/API authentication. Fixed by generating a Docker Hub Personal Access Token and updating the Jenkins credential.

**Challenge 2 — Wrong Docker Registry URL**
The pipeline was using `https://registry.hub.docker.com` which caused login issues. Fixed by updating to the correct endpoint `https://index.docker.io/v1/`.

**Challenge 3 — Groovy String Interpolation**
The build-number tag `image.push('build-${env.BUILD_NUMBER}')` used single quotes which don't interpolate variables in Groovy, causing an invalid tag error. Fixed by switching to double quotes `image.push("build-${env.BUILD_NUMBER}")`.

### Learning Outcomes
- How to set up and configure a Jenkins CI/CD pipeline from scratch
- How to write a declarative Jenkinsfile with multiple stages
- The difference between Docker Hub password and Access Token authentication
- How Groovy string interpolation works (single vs double quotes)
- How to publish JUnit test results in Jenkins

---

## Assignment 3 — GitHub Actions CI/CD with Render Deployment

### Objective
Configure a GitHub Actions workflow to automate building a Docker container, pushing it to DockerHub, and deploying it on Render.com.

### Tools & Technologies
| Tool | Purpose |
|---|---|
| GitHub Actions | CI/CD automation |
| Docker | Containerization |
| DockerHub | Container registry |
| Render.com | Cloud deployment |
| PostgreSQL | Database (Render managed) |
| Node.js & npm | Backend runtime |
| Jest | Testing framework |

### Steps Taken

**Step 1 — Verified Repository and Dockerfile**

Updated `Dockerfile` to use `node:20-alpine` as required:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Step 2 — Fixed Database Connection for Render**

The original `db.js` used individual environment variables (`DB_HOST`, `DB_USER`, etc.) which don't work on Render. Updated to use a single `DATABASE_URL` connection string with SSL support:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

**Step 3 — Created GitHub Actions Workflow**

Created `.github/workflows/main.yml`:
```yaml
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
```

**Step 4 — Added GitHub Secrets**
Added the following secrets under GitHub repo → Settings → Secrets and variables → Actions:
- `DOCKERHUB_USERNAME` — DockerHub username
- `DOCKERHUB_TOKEN` — DockerHub Personal Access Token
- `RENDER_DEPLOY_WEBHOOK` — Render deploy hook URL (from Render → Web Service → Settings → Deploy Hook)

**Step 5 — Deployed on Render.com**
- Created a new Web Service on Render using "Deploy from existing image"
- Set image to `docker.io/dyeshi/be-todo:latest`
- Added environment variables: `PORT=3000` and `DATABASE_URL` (Internal DB URL from Render PostgreSQL)
- Copied the Deploy Hook URL and added it as `RENDER_DEPLOY_WEBHOOK` in GitHub secrets

### Challenges Faced

**Challenge 1 — App Crashing with ECONNREFUSED on Render**
The app crashed on Render with `Error: connect ECONNREFUSED ::1:5432` because the `db.js` file was configured to use individual variables (`DB_HOST`, `DB_USER`, etc.) but Render provides a single `DATABASE_URL`. Fixed by refactoring `db.js` to use `connectionString: process.env.DATABASE_URL` with SSL enabled.

**Challenge 2 — Render Requires SSL for PostgreSQL**
Even after fixing the connection string, connections failed without SSL. Added `ssl: { rejectUnauthorized: false }` to the Pool configuration to allow Render's SSL-secured database connections.

**Challenge 3 — Empty RENDER_DEPLOY_WEBHOOK Secret**
The first GitHub Actions run failed with `curl: (2) no URL specified` because the `RENDER_DEPLOY_WEBHOOK` secret was not set. Fixed by getting the Deploy Hook URL from Render's web service settings and adding it as a GitHub secret.

### Learning Outcomes
- How to create and configure a GitHub Actions CI/CD workflow
- How to securely manage secrets in GitHub Actions (never hardcoding credentials)
- How Render's PostgreSQL requires SSL and a single `DATABASE_URL` connection string
- How to trigger automated Render redeployments using deploy webhooks
- The full CI/CD pipeline: code push → GitHub Actions → DockerHub → Render deployment

---

## Live Deployment

| Service | URL |
|---|---|
| Backend API | https://be-todo-latest-yi2n.onrender.com |
| DockerHub Image | https://hub.docker.com/r/dyeshi/be-todo |

---

## Key Takeaways Across All Assignments

1. **Environment variables** are critical for separating configuration from code — never commit `.env` files
2. **Docker** makes applications portable and consistent across environments
3. **CI/CD pipelines** (Jenkins and GitHub Actions) automate the repetitive tasks of building, testing, and deploying
4. **Cloud platforms** like Render have their own requirements (SSL for DB, single connection string) that differ from local development
5. **Secrets management** is essential — use Jenkins credentials and GitHub secrets instead of hardcoding sensitive values
