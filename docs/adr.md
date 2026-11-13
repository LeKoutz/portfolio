# ADR: Portfolio

## 1. Host all projects behind one reverse proxy on Render

Status: replaced by decision 2

### Context

When this was set up, I understood Render's free plan to allow only one web service.
Several projects need their own Go server, so they all had to run inside that one
service.

### Decision

- Each live project is added to `projects/` as a git subtree.
- `build.sh` builds a binary for each Go project. `startup.sh` starts each one on its own
  internal port, then starts the proxy.
- The proxy (`proxy/`) serves the landing page and sends each project's route
  (`/<repo-name>/`) to that project's port. Static JS projects (port `-`) are served as
  files, with no binary.
- The project list comes from two files:
  - `projects.json`: every project shown on the site, with `live`, `wip`, `exclude` and
    extra tech tags.
  - `projects.conf`: only the live projects, with repo, branch, port and build path.
- Title, description, main language and last update come from the GitHub API at startup.

The README has the full steps for adding a project.

### Problems

- Adding a live project means editing two files that have to agree with each other.
- Go projects need a `portfolio_version` branch with their paths changed so they work
  under `/<repo-name>/`. A project written to run at `/` breaks there, because its links,
  form actions and asset URLs point to `/`.
- `build.sh` stops at the first failed build, so one broken project blocks the whole
  deploy.
- The landing page is on the same free service, so visitors wait about a minute for it
  after it spins down.
- Projects with a database (forum, real-time-forum) aren't set up to run yet.

### Alternatives (researched 2026-11-13)

| Option | Free | Card needed | Verdict |
|---|---|---|---|
| Stay as is: one Render service with the proxy | yes | no | rejected, keeps the problems above |
| One Render free service per project, static landing page | yes | no | chosen, see decision 2 |
| Google Cloud Run | free tier: 2M requests, 180,000 vCPU-seconds a month | yes, billing account | rejected because it needs a card |
| Oracle Cloud Always Free VM | yes | yes | rejected: I'd run the server myself, idle VMs get reclaimed, and 2026 reports say the free allowance is being cut |
| Fly.io | no free tier for new accounts | | rejected |
| Koyeb | one small service | reported to need a card since 2026 | rejected, one service is too few |
| Railway | $1 of credit a month after the trial | no | rejected, not enough to run several projects |

## 2. Each project is its own Render service, static landing page on GitHub Pages

Status: accepted (2026-11-13)

### Decision

- The landing page is a static site on GitHub Pages, online 24/7 with no cold start.
- Each live project is its own Render free web service, deployed from its own GitHub repo
  and served at the root of its own `onrender.com` address. No reverse proxy, no subtrees,
  no `portfolio_version` branches.
- Each static project (HTML, CSS and JS with no server, like make-your-game) is deployed
  with GitHub Pages from its own repo, at its own GitHub Pages URL.
- The landing page links each project to its live demo (Render or GitHub Pages) and to
  its GitHub repo for the source code. Both kinds of demo are just a URL to the landing
  page.
- Files only the old setup needs are removed: `proxy/`, `projects/` (the subtrees),
  `projects.conf`, `build.sh`, `startup.sh` and the `Makefile`. The README is rewritten
  for the new setup.

### Why

- Render allows more than one free service. Its docs set no limit on free services, and
  a Hobby workspace can have 25 services in total (render.com/docs/new-workspace-plans).
  Confirmed on 2026-11-13: ascii-art-web runs as a second free service at
  https://ascii-art-web-bsjg.onrender.com.
- Projects run unchanged, because each one is served at `/`.
- Adding a project: deploy it on Render or GitHub Pages, then fill in its repo's About
  settings (decision 3).
- One broken project doesn't stop the others from deploying.

### Costs

- Each demo has its own cold start of about a minute the first time it's opened after 15
  minutes without traffic.
- Each project is set up once in Render's dashboard.
- The 750 free hours a month are shared by all free services, which is about one service
  running all month. Several services fit only because they spin down when idle. If
  they're all kept awake, the hours run out and every free service stops until the next
  month.
- No persistent disk: a SQLite file is lost on every redeploy, restart or spin-down. Free
  Postgres expires 30 days after it's created.

### Guidelines for new projects

- Read the port from the `PORT` environment variable.
- Use URLs that work when the project is served at `/`.
- Projects with SQLite create and fill their database at startup, because the file is
  lost on every spin-down.
- Fill in the repo's About settings: description, Website (the demo URL) and topics,
  including `portfolio` to show it.
- Tag a repo with the tools that matter in that project, and its areas. The page builds
  each area's skills from these topics, so it's only as accurate as the tagging. A topic
  with no skill file is logged in the browser console, which catches typos.
- Static projects use relative URLs (`style.css`, not `/style.css`), because GitHub Pages
  serves a project repo under `/<repo-name>/`. make-your-game already works this way,
  since the proxy serves it under `/make-your-game/` today.

## 3. The page fetches GitHub data in the browser, with no build step

Status: accepted (2026-11-13)

### Decision

The page is plain HTML, CSS and JS plus content files, served by GitHub Pages as they are.
On each visit, its JavaScript makes one call to
`GET https://api.github.com/users/LeKoutz/repos?per_page=100` to get the repos and their
data. If the call fails, for example after 60 calls in an hour from the same IP, the page
shows no projects. It then shows a message with a link to my GitHub profile instead of an
empty list. Skills and texts are in this repo's files, so they still show.

### Why

- No build step to maintain: edit a content file, push, and it's live.
- "X time ago" and "Years of experience" are always current.
- One call per visit fits GitHub's limit for calls without a login: 60 an hour per
  visitor's IP. Checked on 2026-11-13: one call returned all 14 public repos, with
  `x-ratelimit-limit: 60`.

### Alternative

A GitHub Action that builds the page on push and once a day. Rejected: it adds a build
step, and dates could be a day old.

### Which projects are shown, and where their data comes from

Everything about a project lives on its GitHub repo. There is no projects file.

| Shown on the page | GitHub repo setting | API field |
|---|---|---|
| Whether it's shown | the `portfolio` topic | `topics` |
| Title | repo name | `name` |
| Description | About, Description | `description` |
| Demo link, "live" label, where the card links | About, Website | `homepage` |
| Tech tags | About, Topics | `topics` |
| Code link | the repo itself | `html_url` |
| "X time ago" | last push | `pushed_at` |

Projects are sorted newest first, by last push.

Adding a project: add the `portfolio` topic to its repo. Removing one: remove the topic.
Nothing changes in this repo.

Rejected:

- A `projects.json` that lists the repo names. It keeps control of the order, but every
  project change needs a commit here.
- Showing every public repo with an exclude list, like today's `exclude` field. Every
  test or piscine repo would show until it's excluded.

### Notes

- The call returns public repos only. GitHub's docs: "Lists public repositories for the
  specified user." Private repos need a token, which can't go in a static page because any
  visitor can read it.
- Topic rules, from GitHub's docs: "lowercase letters, numbers, and hyphens", "50
  characters or less", "no more than 20 topics". So a tag is `go`, never `Go` or `C++`.
- On project cards, only topics that match a skill are shown as tech tags, so `zone01`
  and `portfolio` stay hidden. A topic with no skill file still has its own skill page
  (decision 4).
- Checked on 2026-11-13, most repos aren't ready yet: many have no Website or topics,
  some have no description, and ascii-art-web and groupie-tracker still point at the old
  proxy URLs. Each project needs its About settings filled in once.

## 4. Skills are constants in `skills/*.js`

Status: accepted (2026-11-13)

### Decision

Each skill is a JS file in `skills/` with its constants: the GitHub topic it matches
(`go`), the display name (`Go`), the date I started using it, and a paragraph about what
I've done with it, written as HTML in a template string.

`skills/index.js` imports every skill file and exports them as one list. The browser can
only fetch a file whose name some code writes out, so this file is where the names go.
Adding a skill: create its file and add one `import` line to `skills/index.js`. The page's
own code (`js/main.js`) doesn't change.

```js
// skills/go.js
export default {
  topic: "go",          // must match the GitHub topic exactly
  name: "Go",           // how it's shown on the page
  category: "language", // language, tool, platform or area
  since: "2025-06",     // Years of experience is counted from this
  about: `<p>Implemented asynchronous flows using <strong>goroutines</strong>...</p>`,
};
```

"Used in" lists the shown repos whose topics include `skill.topic`, newest push first,
each with "X time ago". The same list proves the skill (story 5).

A topic on a shown repo with no skill file shows just the topic name and its "Used in"
list.

The page groups skills by `category`. An area (systems, DevOps, security, networking) is a
skill with `category: "area"` and its own topic on the repos, so it needs no separate
mechanism (story 8).
Texts (bio, headings, footer) are written in `index.html`. Rejected: constants in a JS
file, or a separate HTML file loaded by JS. Both add a step for text that changes rarely.

### Why

- Skills change rarely, so a separate content format doesn't pay for itself.
- The start date can't come from GitHub: repos are created later than the work starts.
  Checked on 2026-11-13: groupie-tracker's repo was created 2025-12-09, but I started in
  June 2025.

### Rejected

- `skills.json`: paragraphs with formatting become HTML inside JSON strings.
- Markdown files: they read well, but need a library to turn Markdown into HTML.

## 5. Skill and area pages are one `skill.html`, chosen by the query string

Status: accepted (2026-11-13)

### Decision

- `index.html` is the portfolio. `skill.html` shows one skill or area, picked by the query
  string: `skill.html?topic=go`. Its JS reads the topic with
  `new URLSearchParams(location.search).get("topic")`.
- The navbar links to the projects and skills sections of `index.html`. An about page
  (`about.html`, plain HTML like the others) is a future upgrade, see the PRD.
- A tech tag on a project is a plain link to `skill.html?topic=<topic>`. Tags don't filter
  the project list.
- The GitHub API answer is saved in `sessionStorage` on the first call and reused by every
  page until the tab is closed, so a visit still costs one API call.
- The search finds projects and skills by title, description, topics, skill names and
  skill paragraphs (story 6).

### Why

- GitHub Pages finds a file by its path and ignores the query string. Checked on
  2026-11-13 on make-your-game: `/make-your-game/index.html?topic=go` and `?topic=rust`
  both returned the same file (200, 1042 bytes), while `/make-your-game/skill/go`
  returned 404.
- Every skill page has a link a recruiter can share, refreshing keeps the skill, and the
  back button returns to the portfolio. No routing code and no workaround.

### Rejected

- Paths like `/portfolio/skill/go`. GitHub Pages only serves files that exist and has no
  rewrite rules, so opening such a link fresh gives a 404 without a `404.html` redirect
  trick.
- Hash addresses like `#/skill/go`.
- An overlay with no address of its own: no shareable link, and the back button leaves the
  portfolio.
- Moving the page to a Render static site for its rewrite rule (`/*` to `/index.html`). It
  reverses decision 2.

### Page loads

Opening a skill page is a normal page load. The CSS and JS are already cached, and the
repo data comes from `sessionStorage`, so it's fast.

Both pages include `@view-transition { navigation: auto; }`, mostly as an experiment. It
animates between two pages of the same site. MDN marks it "Limited availability", and
browsers without it load the page normally.

### Future upgrade

Skipping the page load: JS catches the click on a tag link, draws the skill in place,
updates the address with `history.pushState`, and handles the back button with the
`popstate` event. Left for later because it brings back routing code and needs both
pages to draw the skill view.

## 6. Repo, address and the old service

Status: accepted (2026-11-13)

- The repo stays `portfolio`. GitHub Pages serves it at `https://lekoutz.github.io/portfolio/`,
  so the page uses relative URLs, the same rule as static projects.
- The current Render service (`portfolio-kky4.onrender.com`) is deleted once the new
  page is live. Each live project gets its own service, like ascii-art-web. Repos whose
  Website still points at the old service (ascii-art-web, groupie-tracker) get their
  new URL.

## 7. Opening a sleeping demo

Status: accepted (2026-11-13)

### Decision

Clicking a live project's card, or "see it live" on a skill page, opens the demo in a new
tab right away (decision 8). While a Render service wakes up,
Render shows its own loading page in that tab (render.com/docs/free: "Browsers see a
loading page meanwhile"). The portfolio builds no waiting screen of its own and shows no
cold start warning.

### Rejected

- Waking every demo when a visitor arrives. Every visit would keep every demo awake for
  at least 15 minutes, and the 750 free hours a month are shared. With 5 demos, about
  600 visits a month would stop every free service until the next month.
- A "waking up" animation on the portfolio that opens the demo once it's ready:
  - The portfolio can't tell when the demo is ready. The demo is on another address, so
    the browser hides its answer from the page (CORS). Render's own loading page also
    answers while the service wakes.
  - Browsers block opening a new tab unless it happens right after a click. MDN:
    `window.open()` needs "transient activation", which "only lasts for a short while".
    A tab opened a minute after the click would be blocked as a popup.

## 8. Every link opens in a new tab

Status: accepted (2026-11-13)

### Decision

Every link on the site has `target="_blank"` and `rel="noopener"`: project cards, code
links, demos, skill tags, "Used in" entries, and the GitHub and LinkedIn links.
`rel="noopener"` keeps the opened page from controlling the portfolio's tab.

### Why

A recruiter keeps the portfolio open while checking projects, demos and skills, and comes
back to it in the same tab.

## 9. Theming and CSS structure

Status: accepted (2026-11-13)

### Decision

- **Light and dark:** dark is the default. `[data-theme="light"]` on `<html>` redefines
  the `--color-*` variables, and component CSS doesn't change. Until the visitor uses the
  toggle, the page follows `prefers-color-scheme`. The toggle saves the choice in
  `localStorage`, and a short script in `<head>` reads it before the page draws, so the
  page doesn't flash the wrong theme.
- **Mobile first:** the base CSS is for a 375px screen. One `@media (min-width: 768px)`
  block per component adds the desktop layout.
- **CSS files:**
  - `tokens.css`: the custom properties, dark and light.
  - `utilities.css`: a small hand-written set of property classes for layout and
    spacing, built from the tokens (`.flex`, `.gap-2`, `.p-4`). Only the ones in use.
  - `components.css`: one class per component (`.tag`, `.card`), with element classes
    for its parts (`.card__title`).
- **Variants:** a variant is a `data-` attribute that only sets the component's own
  custom properties. The component's rules use those variables, so a variant repeats no
  CSS rules:

  ```css
  .tag {
    color: var(--tag-fg);
    background: var(--tag-bg);
    border: 0.5px solid var(--tag-border);
  }
  .tag[data-category="tool"] {
    --tag-fg: var(--color-tool-fg);
    --tag-bg: var(--color-tool-bg);
    --tag-border: var(--color-tool-border);
  }
  ```

  The attribute values match the data, so JS writes `data-category="${skill.category}"`
  directly. Screen size is handled by the 768px breakpoint and states by `:hover` and
  `:focus`, not by attributes. Hover and focus are written once on the
  component and work for every variant.
- **Components in JS:** each component the JS builds (card, tag, "Used in" entry) is one
  render function, like `renderCard(repo)`, so its markup and classes are written in one
  place.

### Why

- No build step (decision 3).
- Property classes keep layout and spacing quick to write, while variants stay short.

### Rejected

- Tailwind. Its docs say "The Play CDN is designed for development purposes only, and is
  not intended for production" (tailwindcss.com/docs/installation/play-cdn). The
  production setup is a build step that scans the files and generates the CSS, which
  decision 3 rules out.
- Only property classes, with no component classes. Every tag variant would repeat the
  same long class list in the JS.
- A modifier class per variant (`.tag--tool`) that repeats `color`, `background` and
  `border`. It works, but each variant repeats the same three rules.

## 10. Project cards are links

Status: accepted (2026-11-13)

### Decision

- The whole card is a link: to the demo (`homepage`) when the repo has one, to the repo
  (`html_url`) otherwise. A card with a demo shows a "live" label.
- One `<a>` covers the card: `.card__link`, positioned over the whole card, with the
  project title as its text for screen readers. The "code" link is a separate `<a>`
  placed above it with `position: relative` and a higher `z-index`, so it stays
  clickable. This is the pattern the old `.card__live-link` used.
- On a skill page, each "Used in" entry links to the repo, and live projects add a "see
  it live" button that opens the demo.

### Why

- A bigger click target than a small "try it live" link.
- HTML doesn't allow a link inside another link, so wrapping the whole card in one `<a>`
  would break the "code" link. The covering link avoids that.
