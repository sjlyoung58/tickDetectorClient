# Parked Issues

## GitHub Pages site for Tick Detector documentation

Set up a GitHub Pages site hosted in this repo (`tickDetectorClient`) to serve documentation for the Tick Detector ecosystem.

### DNS
- Add a CNAME DNS record at the registrar/hosting level pointing `tddocs.infomancer.uk` to `<github-username>.github.io`
- Add a `CNAME` file to the `docs/` root containing just `tddocs.infomancer.uk`

### Repo structure (tickDetectorClient)
```
docs/
  CNAME
  _config.yml
  Gemfile
  index.md                        ← landing page
  eddn_client/                    ← docs pushed from ../eddn_client
    README.md
    assets/images/
  TDDiscordBot/                   ← docs pushed from ../TDDiscordBot
    README.md
    USERGUIDE.md
    assets/images/
  tickWebHook/                    ← docs pushed from ../tickWebHook
    README.md
    assets/images/
```

### Source repo structures (linked projects)
All linked repos follow this pattern — README.md stays at root (git convention), docs content lives under `docs/`:

**eddn_client, tickWebHook:**
```
README.md             ← root, stays here
docs/
  .gitkeep            ← keeps the empty folder tracked by git
  assets/images/
```

**TDDiscordBot:**
```
README.md             ← root, stays here
docs/
  USERGUIDE.md
  assets/images/
```

Images must use relative paths in markdown (e.g. `![alt](assets/images/foo.png)`). This works consistently in GitHub repo browsing, local Jekyll preview, and the live Pages site. Avoid absolute URLs (raw.githubusercontent.com etc.) — they are fragile.

### Jekyll config (`docs/_config.yml`)
Minimal starting point with the built-in `minima` theme (no plugins needed, works with GitHub Pages natively):
```yaml
title: Zoy's Tick Detector
description: ZeroMQ pub/sub tick detection for Elite Dangerous BGS
baseurl: ""
url: "https://tddocs.infomancer.uk"
theme: minima

# Tell Jekyll where to find posts/pages
include:
  - CNAME

# Exclude build artefacts
exclude:
  - Gemfile.lock
  - node_modules
  - "*.mjs"
```
If you want a custom theme later, look at `jekyll-remote-theme` which lets you reference any GitHub-hosted theme.

### Gemfile (`docs/Gemfile`)
Needed for local preview only — GitHub Pages builds without it:
```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
```
Then run `bundle install` inside `docs/` to get local Jekyll.

### Local Jekyll setup (for previewing before push)
Prerequisites: Ruby (use `rbenv` or `rvm` to manage versions — system Ruby on Ubuntu is often too old).
```bash
gem install bundler
cd docs && bundle install
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

### GitHub Pages settings
In the repo Settings → Pages:
- Source: **Deploy from a branch**
- Branch: `master` (or `main`), folder: `/docs`

(Alternatively use a GitHub Actions deploy workflow — see below — which gives more control.)

### GitHub Actions — dependent project doc sync
Each dependent project (eddn_client, TDDiscordBot, tickWebHook) needs a workflow that copies its changed docs into this repo on push. Approach:

1. Create a **Personal Access Token** (PAT) or **Deploy Key** with write access to `tickDetectorClient`, stored as a secret in each dependent repo (e.g. `TICKDETECTORCLIENT_DEPLOY_KEY`).
2. Add a workflow in each dependent repo, e.g. `.github/workflows/sync-docs.yml`:
```yaml
name: Sync docs to tickDetectorClient
on:
  push:
    paths:
      - 'docs/**'
      - 'README.md'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Stage README alongside docs
        run: cp README.md docs/README.md
      - name: Push docs to tickDetectorClient
        uses: cpina/github-action-push-to-another-repository@main
        env:
          API_TOKEN_GITHUB: ${{ secrets.TICKDETECTORCLIENT_DEPLOY_KEY }}
        with:
          source-directory: docs/
          destination-github-username: <github-username>
          destination-repository-name: tickDetectorClient
          target-directory: docs/<project-name>/
          commit-message: "docs: sync from <project-name> ${{ github.sha }}"
# Note: README.md is copied into docs/ in the workflow workspace only (not
# committed to the source repo). source-directory: docs/ then picks up the
# full tree recursively including assets/images/ folders.
```
3. The `cpina/github-action-push-to-another-repository` action handles checkout and push of the target repo. Review its docs for branch/auth options.

### Landing page (`docs/index.md`)
A simple Jekyll front-matter page:
```markdown
---
layout: home
title: Zoy's Tick Detector
---

Documentation for the Elite Dangerous BGS Tick Detector ZeroMQ pub/sub service.

- [Client Examples & ZMQ Message Reference](README.md)
- [EDDN Client](eddn_client/)
- [Discord Bot](TDDiscordBot/)
- [WebHook Client](tickWebHook/)
```

### Open questions before starting
- ~~Confirm the subdomain~~ — **`tddocs.infomancer.uk`** chosen
- ~~Decide whether to use a Jekyll theme or plain HTML/CSS~~ — **`minima` theme** to start, change later if needed
- ~~Decide on deploy method~~ — **branch-based** (Settings → Pages, `main` branch, `/docs` folder); Actions-based not needed with `minima` and no custom build step
- ~~Confirm which files from each linked project should be synced~~ — **README.md** (all repos) + **USERGUIDE.md** (TDDiscordBot only), plus `assets/images/`; synced via GitHub Actions workflow in each linked repo
