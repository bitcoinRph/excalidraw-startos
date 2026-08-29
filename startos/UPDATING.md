# Updating the upstream version

"Upstream" for this package is the Excalidraw monorepo itself: this repository is a fork of `excalidraw/excalidraw`, and the container image is built from the repo's own root `Dockerfile` (a static build of `excalidraw-app` served by nginx). There is no Docker tag pin — the packaged code is whatever the fork's `master` contains.

## Determining the upstream version

The version marker is the `@excalidraw/excalidraw` editor version at the repo root:

```sh
node -p "require('../packages/excalidraw/package.json').version"
```

Compare against upstream's latest:

```sh
gh release view -R excalidraw/excalidraw --json tagName -q .tagName
```

## Applying the bump

1. Merge the desired upstream state into this fork's `master` (`git fetch https://github.com/excalidraw/excalidraw.git master && git merge FETCH_HEAD`), resolving any conflicts with the `startos/` wrapper (the wrapper lives entirely in this directory, so conflicts are rare).
2. Update `version` in `startos/versions/current.ts` to `<editor version>:0` (bump only the `:N` downstream revision for wrapper-only changes), and write the release notes.
3. `make` — then install and verify per the packaging guide before releasing.
