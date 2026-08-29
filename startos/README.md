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

| Property      | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Image         | Built from `../Dockerfile` (static app + nginx runtime) |
| Architectures | x86_64, aarch64                                         |
| Command       | `nginx -g 'daemon off;'`                                |

| Subcontainer     | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `excalidraw-sub` | The `primary` daemon — the one to `attach` to |

## Volume and Data Layout

| Volume | Mount Point | Purpose                             |
| ------ | ----------- | ----------------------------------- |
| `main` | `/data`     | Mounted, but the app writes nothing |

Excalidraw is a static single-page app: drawings live in the **browser's** local storage on the client device, not on the server. The volume exists to exercise the standard volume/backup paths, not because there is server-side state.

## File Models

None. There is no server-side configuration file.

## Dependencies

None.

## Network Access and Interfaces

| Interface | Id   | Type | Port | Description                     |
| --------- | ---- | ---- | ---- | ------------------------------- |
| Web UI    | `ui` | ui   | 80   | The web interface of Excalidraw |

The port is bound on the `ui-multi` MultiHost and is not masked.

## Installation and First-Run Flow

Nothing to configure and nothing to reveal. Install it, start it, open the address, and draw. There is no task, no account, and no credential.

## Actions

None.

## Tasks

None.

## Health Checks

| Check     | Displayed       | Method               |
| --------- | --------------- | -------------------- |
| `primary` | "Web Interface" | Port 80 is listening |

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. In practice **the backup is empty**, because drawings are stored client-side in the browser. Users should export `.excalidraw` files for anything they want to keep durably (this is stated in `instructions.md`).

## Limitations and Differences

1. **No live collaboration.** Upstream's collab mode needs the separate `excalidraw-room` websocket server and an encrypted storage backend; this package serves the single-user app only.
2. **No server-side persistence.** Drawings never touch the server; backups do not contain them.
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
  - excalidraw-sub # the only container
volumes:
  main: /data # mounted but unused (drawings live in the browser)
file_models: []
startos_managed_env_vars: []
dependencies: []
interfaces:
  ui: { type: ui, port: 80 }
actions: []
tasks: []
health_checks:
  - primary # displayed "Web Interface"
```
