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

Because the server itself holds no drawing data, StartOS backups of this service do not include your drawings — export files you care about.

## Limitations

- **Live collaboration is not included.** The "Live collaboration" feature requires Excalidraw's separate collaboration room server and encrypted storage backend, which this package does not bundle. Everything single-user works fully offline on your server.
- **Excalidraw+ features** (cloud workspaces, presentations) are part of the commercial excalidraw.com offering and are not part of the open-source app.
