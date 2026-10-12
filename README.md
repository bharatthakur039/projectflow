# ProjectFlow

### 🎯 Project Overview & Objective
**ProjectFlow** is a modern, fullstack Agile project and sprint management platform designed to streamline team collaboration. It enables software teams to manage product backlogs, plan sprint cycles, track work items visually on an interactive drag-and-drop Kanban board, and handle role-based user workflows with automated reporting.

---

### 🛠️ Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Redux Toolkit, `@dnd-kit` (Kanban drag-and-drop), TipTap (rich text editor)
- **Backend & APIs:** Next.js Route Handlers (`/api/v1/...`), Argon2 (password hashing), JWT authentication, Nodemailer, ExcelJS
- **Database & ORM:** PostgreSQL 16, Prisma ORM v5
- **DevOps & Containerization:** Docker (Multi-stage build), Docker Compose, GitHub Actions (CI/CD)

---

## 📋 Prerequisites

Ensure the following tools are installed on your server or local machine:
- **Docker** (v20+)
- **Docker Compose** (v2+)
- **Git**

---

## ⚙️ Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.production
   ```
2. Open `.env.production` and verify/update:
   - `DATABASE_URL`: Your PostgreSQL connection string (Docker local or managed cloud like Render)
   - `JWT_SECRET`: A secure random secret string for authentication tokens
   - `FRONTEND_URL`: Public domain or server IP (e.g., `https://your-domain.com` or `http://localhost:3000`)

---

## 🚀 Server Deployment (Docker)

Run the following commands on the **VPS Server Terminal**:

### 1. Clone the repository
```bash
git clone <repo-url>
cd "ProjectFlow Project"
```

### 2. Configure environment file
```bash
cp .env.example .env.production
# Edit .env.production with your database and domain credentials
```

### 3. Build and launch containers
```bash
docker compose up -d --build
```

### 4. Run database migrations
```bash
docker compose exec app npx prisma migrate deploy
```

### 5. (Optional) Seed initial demo & admin data
```bash
docker compose exec app npm run prisma:seed
```

The application will be live at: **`http://<server-ip>:3000`**

---

## 🛠️ Server Management Commands

Run these commands inside the server terminal to monitor and manage services:

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

- **Execution Environment:** **GitHub Cloud Runner** (isolated cloud runner on GitHub).
- **Trigger Event:** Automatically triggered on every **Pull Request** and **Push** to the `main` branch.
- **Workflow File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

### Automated Checks:
1. **TypeScript Typecheck:** `npx tsc --noEmit` (validates code against type errors)
2. **Next.js Production Build:** `npm run build` (verifies full app compilation)
3. **Docker Build Validation:** Builds and tests the multi-stage Docker image to guarantee production readiness

---

## 🚀 CD (Continuous Deployment / Auto-Deploy)

- **Execution Environment:** **Target Production/VPS Server** via SSH.
- **Trigger Event:** Automatically triggered on push/merge to `main` **only after** all CI checks pass.
- **Workflow File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

### Automated Deployment Steps:
1. Connects to the VPS server over SSH
2. Pulls the latest changes from GitHub (`git pull origin main`)
3. Rebuilds and launches updated containers (`docker compose up -d --build`)
4. Runs pending database migrations (`docker compose exec -T app npx prisma migrate deploy`)
5. Prunes old unused Docker images to conserve server storage (`docker image prune -f`)

### Required GitHub Secrets for CD:
Add these in **GitHub Repo > Settings > Secrets and variables > Actions**:

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `SERVER_HOST` | Public IP address or domain of the VPS | `13.234.xx.xx` |
| `SERVER_USER` | SSH login username | `ubuntu` or `root` |
| `SERVER_SSH_KEY` | Private SSH Key for server authentication | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_APP_PATH` | Path to the project repository on the VPS | `/home/ubuntu/ProjectFlow` |
