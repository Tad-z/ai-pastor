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

### 4. Clone the repo and create `app.env`

> Secrets go in **`app.env`**, not `.env`. Docker Compose eagerly parses any file
> named `.env` with a strict parser that breaks on the multi-line, quoted
> `FIREBASE_PRIVATE_KEY`. `app.env` is mounted into the container as `/app/.env`
> and read by the app's own (lenient) dotenv instead.

```bash
su - deploy
git clone https://github.com/<you>/ai-pastor.git
cd ai-pastor
cp .env.example app.env
nano app.env   # fill in real values — see below
chmod 644 app.env   # readable by the container's non-root `node` user
```

`app.env` lives **only on the VPS** and is gitignored. Required keys:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=...            # Atlas connection string
DB_NAME=...
REDIS_HOST=...             # Upstash
REDIS_PORT=...
REDIS_USERNAME=...
REDIS_PASSWORD=...
REDIS_TLS=false            # keep false — this Upstash DB uses a plaintext endpoint (as on Render)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> **Redis TLS:** keep `REDIS_TLS=false`. This Upstash database uses a plaintext
> endpoint (that's how it ran on Render — no TLS). Only set `true` if your Upstash
> connection string is `rediss://` (TLS). Symptom of a mismatch:
> `ERR_SSL_WRONG_VERSION_NUMBER` on boot (TLS on) or a RESP protocol error (TLS off) —
> flip the value if you see either.

### 5. First manual deploy (verify before wiring CI)

```bash
docker compose up -d --build
docker compose logs -f pastor       # watch for "AI Pastor running on port 3000"
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

## HTTPS (shared Caddy on the box)

This VPS also runs the **iBetYou** stack, whose Caddy container (`ibetyou-caddy`)
already owns ports 80/443 and terminates TLS for `srv1817758.hstgr.cloud`. Only one
process can own those ports, so ai-pastor does **not** run its own Caddy — it is
served **through** the existing iBetYou Caddy via a path prefix.

ai-pastor is reachable at **`https://srv1817758.hstgr.cloud/pastor`** — e.g.
`https://srv1817758.hstgr.cloud/pastor/api/...`. Caddy strips `/pastor`, so the app
still sees `/api/...` unchanged.

**How it's wired:**

1. ai-pastor's `docker-compose.yml` joins the external `ibetyou_default` network
   (service named `pastor` to avoid clashing with iBetYou's `app` service), so
   Caddy can reach it as `http://pastor:3000`.

2. Add a path-prefix route to **iBetYou's** Caddyfile (on the VPS, e.g.
   `/home/debian/TRIVENA/iBetYou/Caddyfile`):

   ```caddy
   srv1817758.hstgr.cloud {
       handle_path /pastor/* {
           reverse_proxy pastor:3000
       }
       handle {
           reverse_proxy app:3001
       }
   }
   ```

3. Reload the shared Caddy (no restart needed):

   ```bash
   docker exec ibetyou-caddy caddy reload --config /etc/caddy/Caddyfile
   ```

Verify: `curl -s https://srv1817758.hstgr.cloud/pastor/health` → `{"status":"ok"}`.
Point the mobile app's base URL at `https://srv1817758.hstgr.cloud/pastor`.

**Upgrading to a real domain later** (recommended before app-store launch): add an
A record for your domain → `187.124.34.130`, then add a dedicated site block to the
iBetYou Caddyfile — `api.yourdomain.com { reverse_proxy pastor:3000 }` — and drop
the `/pastor` prefix. Caddy auto-provisions the cert; nothing else changes.

### Firewall

Ports 80/443 are already open (iBetYou uses them). If `ufw` is enabled, just ensure:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Port 3000 is **not** opened — only Caddy (80/443) is public; the app is bound to
`127.0.0.1` for local debugging only.

---

## Day-to-day operations

```bash
# Logs
docker compose logs -f pastor

# Restart / stop
docker compose restart pastor
docker compose down

# Redeploy manually (same as CI)
git pull && docker compose up -d --build

# Confirm crons are alive (look for "Background jobs started" at boot)
docker compose logs pastor | grep -i "jobs started"
```

## Rollback

```bash
git reset --hard <previous-good-commit>
docker compose up -d --build
```

## Notes / gotchas

- **`app.env` changes are not deployed by CI** (it's gitignored and lives on the VPS).
  After editing `app.env`, run `docker compose up -d` to pick up new values.
- **Graceful shutdown:** on deploy, `docker compose up` sends SIGTERM; the app stops
  crons, drains in-flight requests, and closes Mongo/Redis before exiting (10s cap).
- **Single instance only** — see the warning at the top. If you ever need horizontal
  scaling, the cron jobs must be extracted into a separate single-instance worker or
  guarded with a Redis lock first.
