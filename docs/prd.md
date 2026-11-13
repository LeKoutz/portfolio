# PRD: Portfolio

## What it is

A static portfolio page for recruiters. It shows my projects, skills and stack, and links
to a live demo and the source code of each project.

## Who it's for

- Recruiters, who want to know what I can do and verify it.
- Me, the developer, who keeps the portfolio up to date.

## User stories

### Developer

1. As a developer, I want a portfolio page that demonstrates my projects and skills to
   recruiters.
2. As a developer who owns a portfolio page, I want an easy way to add or remove a project
   without changing the source code or editing many files.
3. As a developer who owns a portfolio page, I want an easy way to add or remove skills
   and stack, and to update my texts.

### Recruiter

4. As a recruiter, I want to easily see the stack and skills the developer is strongest
   in, and their level of familiarity with each.
5. As a recruiter, I want an easy way to verify that the skills and stack the developer
   lists have been used in projects.
6. As a recruiter, I want an easy way to find something specific, for example "Does the
   developer know Go?" or "Is the developer familiar with agentic engineering? If so, how
   do they use it?"
7. As a recruiter, I want a way to reach out to the developer if I'm interested.
8. As a recruiter, I want to see the areas the developer has worked in beyond full-stack,
   like systems, DevOps, security and networking, and the projects and skills in each, so
   I can judge how broad their experience is.

## Requirements

- Hosting is free.
- The landing page is online 24/7.
- Mobile first: the base layout is a phone screen (375px wide), with one breakpoint at
  768px for desktop. On mobile the navbar links collapse into a menu button.
- Light and dark mode. Dark is the default and the page follows the system setting until
  the visitor uses the toggle in the navbar. Their choice is remembered on the next visit.
- Every link opens in a new tab.
- Adding a project needs few or no changes to its source code. Guidelines for building
  new projects so they're ready to host are in the ADR.
- Projects are managed on GitHub, with no change in this repo (story 2).
- Skills and texts change rarely, so they are written in the site's own files (story 3).

## Projects

A project is shown when its GitHub repo has the `portfolio` topic. All its data comes from
the repo's GitHub settings, so adding or removing a project needs no change in this repo
(story 2). Projects are sorted newest first.

Each project shows:

- Title
- Description
- Tech used
- Last update, as "X time ago"
- A "live" label, when the project runs live
- Link to the code

The whole card is a link. It opens the live demo when the project runs live, and the
code on GitHub otherwise.

## Skills

Each skill has a short paragraph about what I've done or built with it, instead of a level
or a rating. For example: "Implemented asynchronous flows using goroutines, protecting
from data races with Mutexes/WaitGroups..." (story 4).

Optional, per skill:

- **Years of experience:** counted from the date I first used the skill, which I write
  once in the content. The count is done in the browser, so it stays current without
  rebuilding the page.

Skills link to projects by tech tags: a skill matches every project with its topic on
GitHub (story 5). Each skill shows:

- **Used in:** every project tagged with the skill, each with "X time ago" from the
  project's last update, newest first, so the top entry shows when I last used the
  skill. Each entry links to the project's code. A project that runs live also has a
  "see it live" button that opens the demo.

The last update is the repo's last push date from the GitHub API, so any push counts,
even a README fix.

Skills are grouped by category: language, tool, platform and area. An area is a field I've
worked in, like systems, DevOps, security or networking (story 8). It works like any other
skill: a topic on the repos, a paragraph about what I've done in it, and "Used in" lists
its projects. An area also shows the skills used in its projects.

A tag shows which category it belongs to, so a recruiter can tell a language from a tool
at a glance.

Clicking a tech tag on a project opens that skill's or area's page, which has its own link
a recruiter can share. Tags don't filter the project list.

## Search

The search finds projects and skills by title, description, tech tags, skill names and
skill paragraphs, so "Go" or "agentic engineering" both find what's relevant (story 6).
It filters the projects and skills on the portfolio page as the visitor types. When
nothing matches, the page says so and suggests a tag to try.

The page doesn't warn visitors that a demo can take about a minute to wake up.

## Texts

The texts (bio, headings) are written in `index.html`.

## Contact

No contact form. The page links to my GitHub and LinkedIn profiles, in the bio and in the
footer (story 7).

## Future upgrades

- **About page:** a page with more about me than the bio: what I'm doing now, how I work,
  a timeline and what I do outside code. Possible
  story: as a recruiter, I want to know the developer beyond their projects.
