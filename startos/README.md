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

From the `startos/` directory, with the [StartOS packaging environment](https://docs.start9.com/packaging) (start-cli, docker buildx, node/npm) installed:

```sh
cd startos
make            # builds excalidraw_x86_64.s9pk and excalidraw_aarch64.s9pk
make x86        # just x86_64
make arm        # just aarch64
make install    # sideload onto the server configured via start-cli
```

The static site is built on the host platform inside the build stage (`FROM --platform=${BUILDPLATFORM}`), so cross-arch packing does not emulate the node build — only the tiny nginx runtime stage is per-arch.

### CI releases

The `.github/workflows/release-s9pk.yml` workflow builds both `.s9pk`s and publishes them as a GitHub release on every push to `master` that touches the package (the `startos/` wrapper, the `Dockerfile`, or the app source), and can also be run manually via workflow dispatch. Releases are keyed to the package version in `startos/startos/versions/current.ts` (tag `v<version>` with `:` mapped to `_`): bumping the version creates a new release, while other changes rebuild and refresh the current release's assets. Set a `DEV_KEY` repository secret (a StartOS developer key PEM) to sign CI builds with a stable identity; without it each run signs with an ephemeral key, which is fine for sideloading.

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
