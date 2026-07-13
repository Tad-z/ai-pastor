# Deployment — VPS + Docker + CI/CD

AI Pastor runs as a **single Docker container** behind **host Nginx** (TLS), deployed
automatically on every push to `main` via GitHub Actions.

- **MongoDB** → Atlas (external, unchanged)
- **Redis** → Upstash (external, unchanged)
- **App + crons** → one Docker container on the VPS

> ⚠️ **Run exactly one app container.** The cron jobs in `src/jobs` run in-process
> (node-cron). A second replica would double-fire every job. Do **not** scale `app`.

---

## Why the VPS fixes the crons

On Render's free tier the service sleeps when idle, so the in-process cron jobs
silently stop firing. On the VPS the process runs 24/7, so all jobs fire reliably:

| Job | Schedule (UTC) |
|-----|----------------|
| Daily usage reset | 23:00 (00:00 WAT) |
| Commitment reminders | every minute |
| Verse cache refresh | 04:55 |
| Daily verse notifications | 05:00 (06:00 WAT) |
| Missed check-ins | 22:59 |
| Memory extraction | every 6h |

The container runs with `TZ=UTC`, so the two interval jobs without an explicit
timezone are anchored to UTC hours.

---

## One-time VPS setup

SSH into the VPS as root (or a sudo user).

### 1. Install Docker + Compose plugin

```bash
curl -fsSL https://get.docker.com | sh
docker compose version   # confirm the compose plugin is present
```

### 2. Create a deploy user (recommended)

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
```

### 3. Set up SSH access for GitHub Actions

Generate a dedicated key pair **locally** (not on the VPS):

```bash
ssh-keygen -t ed25519 -C "github-actions-ai-pastor" -f ai-pastor-deploy
```

Add the **public** key to the deploy user on the VPS:

```bash
# on the VPS
mkdir -p /home/deploy/.ssh
echo "<contents of ai-pastor-deploy.pub>" >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

The **private** key (`ai-pastor-deploy`) goes into the `VPS_SSH_KEY` GitHub secret (step 6).

### 4. Clone the repo and create `.env`

```bash
su - deploy
git clone https://github.com/<you>/ai-pastor.git
cd ai-pastor
cp .env.example .env
nano .env   # fill in real values — see below
```

`.env` lives **only on the VPS** and is gitignored. Required keys:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=...            # Atlas connection string
DB_NAME=...
REDIS_HOST=...             # Upstash
REDIS_PORT=...
REDIS_USERNAME=...
REDIS_PASSWORD=...
REDIS_TLS=true             # Upstash requires TLS
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> **Redis TLS:** on Render this may have worked without TLS. Upstash's standard
> endpoint uses TLS — set `REDIS_TLS=true`. If your endpoint is the non-TLS one,
> leave it `false`. If Redis fails to connect on boot, flip this value.

### 5. First manual deploy (verify before wiring CI)

```bash
docker compose up -d --build
docker compose logs -f app          # watch for "AI Pastor running on port 3000"
curl -s http://127.0.0.1:3000/health
docker inspect --format='{{.State.Health.Status}}' ai-pastor   # -> healthy
```

### 6. Add GitHub repo secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | server IP / hostname |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | contents of the **private** key `ai-pastor-deploy` |
| `VPS_PORT` | SSH port (optional, default 22) |
| `VPS_APP_DIR` | `/home/deploy/ai-pastor` |

After this, every push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml):
pull → `docker compose up -d --build` → wait for healthcheck → done. You can also
trigger it manually from the **Actions** tab (`workflow_dispatch`).

---

## Nginx + HTTPS (host-level)

Nginx runs on the host and proxies public 443 → the app on `127.0.0.1:3000`
(the container is bound to loopback, never exposed directly).

```bash
sudo apt update && sudo apt install -y nginx
sudo cp /home/deploy/ai-pastor/deploy/nginx.conf /etc/nginx/sites-available/ai-pastor
# edit the file: replace api.yourdomain.com with your real domain
sudo ln -s /etc/nginx/sites-available/ai-pastor /etc/nginx/sites-enabled/ai-pastor
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Point an **A record** for your domain at the VPS IP, then enable TLS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Certbot rewrites the Nginx config with the SSL block + HTTP→HTTPS redirect and
auto-renews via its systemd timer. Update the mobile app's base URL to
`https://api.yourdomain.com`.

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Port 3000 is **not** opened — only Nginx (80/443) is public.

---

## Day-to-day operations

```bash
# Logs
docker compose logs -f app

# Restart / stop
docker compose restart app
docker compose down

# Redeploy manually (same as CI)
git pull && docker compose up -d --build

# Confirm crons are alive (look for "Background jobs started" at boot)
docker compose logs app | grep -i "jobs started"
```

## Rollback

```bash
git reset --hard <previous-good-commit>
docker compose up -d --build
```

## Notes / gotchas

- **`.env` changes are not deployed by CI** (it's gitignored and lives on the VPS).
  After editing `.env`, run `docker compose up -d` to pick up new values.
- **Graceful shutdown:** on deploy, `docker compose up` sends SIGTERM; the app stops
  crons, drains in-flight requests, and closes Mongo/Redis before exiting (10s cap).
- **Single instance only** — see the warning at the top. If you ever need horizontal
  scaling, the cron jobs must be extracted into a separate single-instance worker or
  guarded with a Redis lock first.
