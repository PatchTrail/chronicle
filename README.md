# Chronicle — Personal Journal

A self-hosted personal blog/diary with a hopecore-cyberpunk aesthetic.
Runs in Docker, managed via Portainer.

Docker Hub: https://hub.docker.com/r/patchtrail/chronicle
GitHub: https://github.com/PatchTrail/chronicle

---

## Quick Start

### Option A — Docker Run
```bash
docker run -d \
  --name chronicle \
  --restart unless-stopped \
  -p 3791:3000 \
  -v ~/chronicle-data:/app/data \
  patchtrail/chronicle:latest
```

### Option B — Docker Compose
```bash
git clone https://github.com/PatchTrail/chronicle.git
cd chronicle
docker compose up -d
```

Then open: **http://localhost:3791**

---

## Features

- Write entries in Markdown
- Mood tracking with emoji
- Tag entries and filter by tag
- Full-text search
- Edit and delete entries
- SQLite database — all data in `./data/chronicle.db`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + N` | New entry |
| `Ctrl + Enter` | Save entry |
| `Esc` | Go back / close |

## Data

All entries are stored in `./data/chronicle.db` (SQLite). Back it up by just copying that file.

## Port

Default: **3791** — change in `docker-compose.yml` if needed.
