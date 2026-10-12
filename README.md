# ProjectFlow

Agile project and sprint management application built with Next.js 16, Prisma ORM, and PostgreSQL.

---

## 📋 Prerequisites

Ensure the following tools are installed on the production/VPS server:
- **Docker** (v20+)
- **Docker Compose** (v2+)
- **Git**

---

## 🚀 Manual Server Deployment (Docker)

Run the following commands on the **VPS Server Terminal**:

### 1. Clone the repository
```bash
git clone <repo-url>
cd "ProjectFlow Project"
```

### 2. Build and start containers
```bash
docker compose up -d --build
```

### 3. Run database migrations
```bash
docker compose exec app npx prisma migrate deploy
```

### 4. (Optional) Seed initial demo data
```bash
docker compose exec app npm run prisma:seed
```

The application will be live at: **`http://<server-ip>:3000`**

---

## 🛠️ Server Management Commands

Run these commands inside the **VPS Server Terminal** to monitor and manage services:

```bash
# View live application & database logs
docker compose logs -f

# Check status of running containers
docker compose ps

# Restart all containers
docker compose restart

# Stop all containers
docker compose down
```

---

## 🧪 CI (Continuous Integration)

- **Execution Environment:** **GitHub Cloud Runner** (Runs free on GitHub's infrastructure, not on your VPS).
- **Trigger Event:** Triggered automatically on any **Pull Request** or **Push** to the `main` branch.
- **Workflow File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

### Commands executed during CI (in GitHub Actions runner):
```bash
# 1. Typecheck TypeScript codebase for errors
npx tsc --noEmit

# 2. Compile and verify Next.js production build
npm run build

# 3. Validate multi-stage Docker image build
docker build --build-arg NEXT_PUBLIC_API_URL=/api/v1 -t projectflow-app:latest .
```
> **Goal:** Prevents broken code, type errors, or faulty Dockerfiles from reaching production.

---

## 🚀 CD (Continuous Deployment / Auto-Deploy)

- **Execution Environment:** **Customer's VPS Server** (GitHub Actions connects via secure SSH and executes remote commands).
- **Trigger Event:** Runs automatically on push/merge to the `main` branch **only after** all CI checks pass.
- **Workflow File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

### Commands executed during CD (on the VPS Server via SSH):
```bash
# 1. Navigate to the project directory on the server
cd ~/ProjectFlow

# 2. Pull the latest approved changes from GitHub
git pull origin main

# 3. Rebuild and launch updated containers in background
docker compose up -d --build

# 4. Apply new database migrations
docker compose exec -T app npx prisma migrate deploy

# 5. Clean up old unused Docker images to save disk space
docker image prune -f
```

---

## 🔑 CD Setup (Required GitHub Secrets)

To enable automated deployment, add these 4 secrets in **GitHub Repo > Settings > Secrets and variables > Actions**:

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `SERVER_HOST` | Public IP address or domain of the VPS | `13.234.xx.xx` |
| `SERVER_USER` | SSH login username | `ubuntu` or `root` |
| `SERVER_SSH_KEY` | Private SSH Key for server authentication | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_APP_PATH` | Path to the project repository on the VPS | `/home/ubuntu/ProjectFlow` |
