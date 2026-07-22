# Go Portfolio

A self-hosted developer portfolio built in Go. Serves a landing page with project cards and acts as a reverse proxy, routing traffic to multiple sub-projects running as separate services — all under a single domain.

Project metadata is fetched automatically from the GitHub API at startup. Configuration is driven by two files, making it straightforward to add or remove projects without touching application code.

---

## How it works

The portfolio runs as a single process on a configured port. At startup it:

1. Reads `projects.json` for display metadata (live status, extra tech stack tags, excluded projects)
2. Fetches public repo data from the GitHub API (name, description, primary language, last updated)
3. Starts reverse proxies for each live sub-project
4. Serves the landing page with dynamically populated project cards

Sub-projects run as separate processes on internal ports. The proxy routes incoming requests to the correct service based on the URL path prefix.

```
yourdomain.com/              → portfolio landing page
yourdomain.com/project-a/   → sub-project A (internal :8082)
yourdomain.com/project-b/   → sub-project B (internal :8083)
```

---

## Project structure

```
.
├── projects.conf       # operational config: repo, branch, port per project
├── projects.json       # display metadata: live status, extra tags, image, exclude flag
├── projects/           # sub-projects (imported as git subtrees)
│   ├── project-a/
│   └── project-b/
├── proxy/              # portfolio server
│   ├── main.go
│   ├── static/
│   └── template/
├── build.sh            # compiles all sub-projects and the proxy
├── startup.sh          # starts all sub-projects and the proxy
└── Makefile            # subtree updates, port management, cleanup
```

---

## Adding a project

### 1. Import the repository as a git subtree

```bash
git subtree add --prefix=projects/<repo-name> https://github.com/<user>/<repo-name> <branch> --squash
```

### 2. Add an entry to `projects.conf`

```
# repo                      branch      port
user/repo-name              main        8084
```

Use `-` for port if the project is static (no server process).

### 3. Add an entry to `projects.json`

```json
{
    "repo": "user/repo-name",
    "live": true,
    "exclude": false,
    "image": "",
    "extraTechStack": []
}
```

| Field | Description |
|---|---|
| `repo` | Short form `user/repo-name` — must match `projects.conf` and the GitHub API |
| `live` | Whether to show the live tag on the card and set up a reverse proxy |
| `exclude` | Set to `true` to hide the project from the portfolio entirely |
| `image` | Path to a screenshot for the project card (optional) |
| `extraTechStack` | Additional tech tags to append alongside the GitHub primary language |

### 4. Add the project to `proxy/main.go`

Until GitHub API integration is fully automatic, add an entry to the `projects` slice:

```go
{
    Title:       "",          // overridden by GitHub API
    Description: "",          // overridden by GitHub API
    Path:        "/repo-name/",
    Port:        "8084",
    Repository:  "user/repo-name",
},
```

`Title`, `Description`, `TechStack`, and `LastUpdated` are populated automatically from the GitHub API at startup.

### 5. Update subtrees

```bash
make update-all
```

---

## Running locally

**Build all projects:**

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
