<p align="center">
  <img src="icon.svg" alt="Excalidraw Logo" width="21%">
</p>

# Excalidraw on StartOS

> Everything not listed in this document should behave the same as upstream Excalidraw. If a feature, setting, or behavior is not mentioned here, the upstream documentation is accurate and fully applicable — see <https://docs.excalidraw.com/>.

[Excalidraw](https://github.com/excalidraw/excalidraw) is an open-source virtual whiteboard with a hand-drawn aesthetic. This repository is a fork of the upstream Excalidraw monorepo with a StartOS service package added in this `startos/` directory: the package builds the repository's own `Dockerfile` (a static build of `excalidraw-app` served by nginx) into a `.s9pk` installable on a Start9 server.

- **Upstream repo:** <https://github.com/excalidraw/excalidraw>
- **Wrapper repo:** <https://github.com/bitcoinRph/excalidraw-startos>

---

## Repository layout

Unlike most StartOS wrapper repos, the upstream source is not a submodule — this repo _is_ the upstream source (a fork), and the StartOS packaging lives entirely in `startos/`. The image is built from the repo root's `Dockerfile` (`dockerBuild` with `workdir: '..'`), so an upstream update is a merge from `excalidraw/excalidraw` plus a version bump in `startos/startos/versions/current.ts`.

## Building

With the [StartOS packaging environment](https://docs.start9.com/packaging) (start-cli, docker, node/npm, squashfs-tools) installed, initialize a packaging workspace once at the repo root, then build from `startos/`:

```sh
start-cli s9pk init-workspace .   # once, in the repo root (see StartOS compatibility below)
cd startos
npm ci
make x86        # excalidraw_x86_64.s9pk — or: make arm (aarch64), make (both)
make install    # upload to the device configured in .startos/config.yaml
```

The static site is built on the host platform inside the build stage (`FROM --platform=${BUILDPLATFORM}`), so cross-arch packing does not emulate the node build — only the tiny nginx runtime stage is per-arch.

### CI releases

The `.github/workflows/release-s9pk.yml` workflow builds both `.s9pk`s and publishes them as a GitHub release on every push to `master` that touches the package (the `startos/` wrapper, the `Dockerfile`, or the app source), and can also be run manually via workflow dispatch. Releases are keyed to the package version in `startos/startos/install/versions/` (tag `v<version>` with `:` mapped to `_`): bumping the version creates a new release, while other changes rebuild and refresh the current release's assets. Set a `DEV_KEY` repository secret (a StartOS developer key PEM) to sign CI builds with a stable identity; without it each run signs with an ephemeral key, which is fine for sideloading.

### StartOS compatibility

This wrapper follows the official packaging guide's current template (`start-cli s9pk init-package`): **`@start9labs/start-sdk` 2.0.9** (the current `start-sdk/v2.0.9` release), whose build system (`s9pk.mk`) ships inside the SDK npm package. It stamps `osVersion: 0.4.0-beta.10` into the manifest, so the package installs on StartOS **0.4.0-beta.10 or newer** — including the released 0.4.0.x line.

Pack with the **latest `start-cli/*` release** from `Start9Labs/start-technologies` (installer: `curl -fsSL https://start9.com/start-cli/install.sh | sh`). Do **not** use the CLI binary attached to other components' releases (e.g. the plain `v0.4.0-beta.*` tags) — it packs an older s9pk layout.

Packing requires a **packaging workspace** in the repo root (the parent of this directory): `start-cli s9pk init-workspace .` provisions `.startos/` with the build signing key (git-ignored — never commit it). If the scaffolded `.startos/config.yaml` contains the placeholder `host: http://dev-vm.local`, comment it out (or set your real device) — the placeholder resolves nowhere and fails bare `start-cli` commands (fixed in start-cli 1.1.1).

## Image and Container Runtime

| Property      | Value                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Image         | Built from `../Dockerfile` (static app + nginx runtime + node for the API) |
| Architectures | x86_64, aarch64                                                            |

| Daemon    | Command                                    | Purpose                                             |
| --------- | ------------------------------------------ | --------------------------------------------------- |
| `api`     | `node /usr/lib/excalidraw-api/server.mjs`  | Scenes API sidecar (`startos/api/server.mjs`)       |
| `primary` | `nginx -g 'daemon off;'`                   | Serves the app; proxies `/api` to the sidecar       |

Both daemons share the single `excalidraw-sub` subcontainer (so nginx reaches the API on localhost); `primary` requires `api`.

## Volume and Data Layout

| Volume    | Mount Point         | Purpose                                             |
| --------- | ------------------- | --------------------------------------------------- |
| `main`    | `/data`             | Server scenes live in `/data/scenes/*.excalidraw`   |
| `startos` | _(never mounted)_   | `store.json` — the generated API token              |

The browser canvas itself still lives in the **browser's** local storage on the client device; only scenes explicitly saved to the server (via the app's command palette or the API) are stored in `main`.

## Scenes API

A dependency-free Node server (`startos/api/server.mjs`) listening on localhost:3040, reverse-proxied by nginx at the `/api` path of the UI port. Bearer-token auth (`Authorization: Bearer <token>`); fails closed (503) if no token is configured; `/api/health` is unauthenticated.

| Route                 | Method | Purpose                             |
| --------------------- | ------ | ----------------------------------- |
| `/api/health`         | GET    | Liveness + whether auth is set (no auth) |
| `/api/scenes`         | GET    | List scenes (`name`, `size`, `modified`) |
| `/api/scenes/<name>`  | GET    | Fetch the `.excalidraw` document    |
| `/api/scenes/<name>`  | PUT    | Save/overwrite (valid JSON object required, 64 MB max) |
| `/api/scenes/<name>`  | DELETE | Delete                              |

The web app integrates with the same API ("Save to server" / "Open from server" in the command palette — `excalidraw-app/components/ServerScenesDialog.tsx`, `excalidraw-app/data/serverScenes.ts`); the commands appear only when `/api/health` responds, so they never show on non-StartOS deployments.

## File Models

| File                       | Volume    | Contents                             |
| -------------------------- | --------- | ------------------------------------ |
| `store.json` (`storeJson`) | `startos` | `apiToken` — generated on first init |

## Dependencies

None.

## Network Access and Interfaces

| Interface  | Id    | Type | Port | Description                                      |
| ---------- | ----- | ---- | ---- | ------------------------------------------------ |
| Web UI     | `ui`  | ui   | 80   | The web interface of Excalidraw                  |
| Scenes API | `api` | api  | 80   | Same origin, path `/api`; masked (copyable URL)  |

Both are exported from the same `ui-multi` MultiHost origin.

## Installation and First-Run Flow

Nothing to configure: install, start, open the address, draw. The API token is generated automatically on first init (`startos/init/apiToken.ts`); users only need it if they use the scenes API or the in-app server-scenes commands (**Show API Token** action).

## Actions

| Action             | Id                 | Behavior                                        |
| ------------------ | ------------------ | ----------------------------------------------- |
| Show API Token     | `show-api-token`   | Displays the stored token (masked, copyable)    |
| Rotate API Token   | `rotate-api-token` | Generates + stores a new token, returns it; the api daemon restarts via the reactive store read in `main.ts` |

## Tasks

None.

## Health Checks

| Check     | Displayed       | Method                 |
| --------- | --------------- | ---------------------- |
| `api`     | "Scenes API"    | Port 3040 is listening |
| `primary` | "Web Interface" | Port 80 is listening   |

## Backups and Restore

`sdk.Backups.ofVolumes('main', 'startos')` — backups now contain the server scenes **and** the API token. The per-browser canvas is still client-side and never in backups.

## Limitations and Differences

1. **No live collaboration.** Upstream's collab mode needs the separate `excalidraw-room` websocket server and an encrypted storage backend; this package serves the single-user app only.
2. **The live canvas is client-side.** Only explicitly saved server scenes persist on the server; the working canvas remains in browser storage.
3. **Excalidraw+** (the commercial cloud offering) is not part of the open-source app and not part of this package.

---

## Quick Reference for AI Consumers

```yaml
package_id: excalidraw
image: built from ../Dockerfile (dockerBuild, workdir '..')
architectures:
  - x86_64
  - aarch64
subcontainers:
  - excalidraw-sub # shared by both daemons
daemons:
  - api # node /usr/lib/excalidraw-api/server.mjs (port 3040, localhost)
  - primary # nginx, requires api
volumes:
  main: /data # server scenes in /data/scenes
  startos: null # store.json (apiToken), never mounted
file_models:
  - store.json # { apiToken } on the startos volume
startos_managed_env_vars:
  - EXCALIDRAW_API_TOKEN # from store.json, into the api daemon
  - EXCALIDRAW_API_PORT # 3040
  - EXCALIDRAW_API_DATA # /data/scenes
dependencies: []
interfaces:
  ui: { type: ui, port: 80 }
  api: { type: api, port: 80, path: /api, masked: true }
actions:
  - show-api-token
  - rotate-api-token
tasks: []
health_checks:
  - api # displayed "Scenes API"
  - primary # displayed "Web Interface"
```
