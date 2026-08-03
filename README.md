# Go Portfolio

A self-hosted developer portfolio built in Go. Serves a landing page with project cards and acts as a reverse proxy, routing traffic to multiple sub-projects running as separate services — all under a single domain.

Project metadata is fetched automatically from the GitHub API at startup. Configuration is driven by two files, making it straightforward to add or remove projects without touching application code.

---

## How it works

The portfolio runs as a single process on a configured port. At startup it:

1. Reads `projects.json` for display metadata for all projects
2. Reads `projects.conf` for deployment config (which projects are live and on which port)
3. Fetches public repo data from the GitHub API (name, description, primary language, last updated)
4. Sets up routing only for projects listed in `projects.conf`
5. Serves the landing page with dynamically populated project cards

Sub-projects run as separate processes on internal ports. The proxy routes incoming requests to the correct service based on the URL path prefix.

```
yourdomain.com/              → portfolio landing page
yourdomain.com/project-a/   → sub-project A (internal :8082)
yourdomain.com/project-b/   → sub-project B (internal :8083)
```

Projects listed in `projects.json` but not in `projects.conf` appear as cards on the landing page but have no live link and are not built or started.

---

## Project structure

```
.
├── projects.conf       # deployment config: repo, branch, port (live projects only)
├── projects.json       # display metadata: all projects including non-deployed
├── projects/           # sub-projects (imported as git subtrees)
│   ├── project-a/
│   └── project-b/
├── proxy/              # portfolio server
│   ├── main.go
│   ├── static/
│   └── template/
├── build.sh            # compiles all projects listed in projects.conf
├── startup.sh          # starts all projects listed in projects.conf
└── Makefile            # subtree updates, port management, cleanup
```

---

## Configuration files

### `projects.json`

The source of truth for what appears on the portfolio. Every project — deployed or not — has an entry here.

```json
[
    {
        "repo": "user/repo-name",
        "live": true,
        "wip": false,
        "exclude": false,
        "image": "",
        "extraTechStack": ["HTML", "CSS"]
    }
]
```

| Field | Description |
|---|---|
| `repo` | Short form `user/repo-name` — must match the GitHub repo path |
| `live` | Whether the project is deployed and accessible via a live link |
| `wip` | Marks the project as work in progress — shown on the card |
| `exclude` | Set to `true` to hide the project from the portfolio entirely |
| `image` | Path to a screenshot for the project card (optional) |
| `extraTechStack` | Additional tech tags to append alongside the GitHub primary language |

### `projects.conf`

Controls what gets built, started, and routed. Only include projects that are actively deployed.

```
# repo                          branch               port
user/repo-name                  portfolio_version    8082
user/js-project                 main                 -
```

- Use `portfolio_version` for Go projects that required path adjustments for the proxy
- Use `main` for JS-only static projects
- Use `-` for port if the project is static (no server process needed)

---

## Adding a project

### Showcase only (not deployed)

Add an entry to `projects.json` only. The card will appear on the landing page with no live link.

### Deployed project

1. **Import the repository as a git subtree:**

```bash
git subtree add --prefix=projects/<repo-name> https://github.com/<user>/<repo-name> <branch> --squash
```

2. **Add an entry to `projects.conf`:**

```
user/repo-name    portfolio_version    8082
```

3. **Add an entry to `projects.json`:**

```json
{
    "repo": "user/repo-name",
    "live": true,
    "wip": false,
    "exclude": false,
    "image": "",
    "extraTechStack": []
}
```

No changes to application code are needed. The project will be built, started, routed, and displayed automatically.

---

## Running locally

**Build all deployed projects:**

```bash
bash build.sh
```

**Start all services:**

```bash
bash startup.sh
```

The portfolio will be available at `http://localhost:8080`.

---

## Makefile targets

| Target | Description |
|---|---|
| `make update-all` | Pull latest changes for all subtrees from their remotes |
| `make clean` | Remove all compiled binaries |
| `make kill-ports` | Kill processes on all ports defined in `projects.conf` |
| `make clean-all` | Kill ports and remove binaries |

---

## Deployment

The project is designed for deployment on [Render](https://render.com) as a single web service.

- **Build command:** `bash build.sh`
- **Start command:** `bash startup.sh`

Render injects the `PORT` environment variable automatically. The proxy reads it at startup and falls back to `:8080` if not set.
