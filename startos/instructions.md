# Excalidraw

You've installed Excalidraw — an open-source virtual whiteboard with a hand-drawn aesthetic. There's nothing to configure: the service starts on its own and is immediately usable.

## Documentation

- [Excalidraw documentation](https://docs.excalidraw.com/) — upstream docs for the editor and its features.
- [Excalidraw upstream repo](https://github.com/excalidraw/excalidraw) — the source this package builds.

## What you get on StartOS

- **Your own Excalidraw instance**, served from your Start9 server — no reliance on excalidraw.com.
- **Nothing to configure and no accounts** — open it and start drawing.

## Getting started

1. Open Excalidraw's **Dashboard** tab.
2. Click the **Web UI** interface to open the whiteboard in your browser.
3. Start drawing. Your work is saved automatically as you go.

## Where your drawings live

Excalidraw stores your active canvas **in your browser's local storage, on the device you're drawing from** — not on the server. This has two practical consequences:

- Drawings do not sync between devices or browsers. Each browser has its own canvas.
- Clearing your browser's site data clears your canvas. Use **Export** (menu → Save to file) to keep `.excalidraw` files of anything important; you can re-open them from any device.

To keep drawings on the server (and in StartOS backups), save them as **server scenes** — from inside the app or via the API, below.

## Server scenes (in the app)

This package adds optional server-side scene storage. In the whiteboard, open the **command palette** (Ctrl/Cmd+P) and use:

- **Save to server** — store the current canvas as a named scene on your Start9 server.
- **Open from server** — list your saved scenes and load one.

The first use asks for your **API token** — get it from the service's **Actions → Show API Token** on StartOS and paste it once; your browser remembers it. Scenes saved this way live on the server's data volume and are included in StartOS backups.

## Scenes API (for CLIs and scripts)

The same storage is exposed as a small REST API at the `/api` path of the Web UI address (also shown as the **Scenes API** interface on the Dashboard). Every request needs the bearer token from **Actions → Show API Token**; rotate it any time with **Actions → Rotate API Token**.

```sh
BASE=https://<your-excalidraw-address>   # Web UI address, no trailing slash
TOKEN=<from Show API Token>

curl -H "Authorization: Bearer $TOKEN" $BASE/api/scenes                    # list scenes
curl -H "Authorization: Bearer $TOKEN" -T drawing.excalidraw \
     -X PUT $BASE/api/scenes/drawing                                      # upload/save
curl -H "Authorization: Bearer $TOKEN" -o drawing.excalidraw \
     $BASE/api/scenes/drawing                                             # download
curl -H "Authorization: Bearer $TOKEN" -X DELETE $BASE/api/scenes/drawing # delete
curl $BASE/api/health                                                     # no auth needed
```

Scene names may contain letters, digits, spaces, and `. _ ( ) -` (max 128 characters); uploads must be valid `.excalidraw` JSON.

Because scenes are stored on the service's data volume, **StartOS backups now include your server scenes** (but still not the per-browser canvas — save or export anything important).

## Limitations

- **Live collaboration is not included.** The "Live collaboration" feature requires Excalidraw's separate collaboration room server and encrypted storage backend, which this package does not bundle. Everything single-user works fully offline on your server.
- **Excalidraw+ features** (cloud workspaces, presentations) are part of the commercial excalidraw.com offering and are not part of the open-source app.
