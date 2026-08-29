import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { FilledButton } from "@excalidraw/excalidraw/components/FilledButton";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { TrashIcon } from "@excalidraw/excalidraw/components/icons";
import { useCallback, useEffect, useState } from "react";

import {
  ServerScenesError,
  deleteServerScene,
  getServerScenesToken,
  listServerScenes,
  loadServerScene,
  saveServerScene,
  setServerScenesToken,
} from "../data/serverScenes";

import "./ServerScenesDialog.scss";

import type { ServerSceneInfo } from "../data/serverScenes";

// Strings are intentionally hardcoded (English): this dialog only exists in
// the self-hosted StartOS build, and keeping it out of the upstream locale
// files keeps upstream merges conflict-free.

export type ServerScenesMode = "save" | "open";

export const ServerScenesDialog = ({
  mode,
  initialName,
  getSceneJson,
  applyScene,
  onClose,
}: {
  mode: ServerScenesMode;
  initialName: string;
  getSceneJson: () => string;
  applyScene: (blob: Blob) => Promise<void>;
  onClose: () => void;
}) => {
  const [scenes, setScenes] = useState<ServerSceneInfo[] | null>(null);
  const [name, setName] = useState(initialName);
  const [token, setToken] = useState("");
  const [needsToken, setNeedsToken] = useState(!getServerScenesToken());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown) => {
    if (err instanceof ServerScenesError && err.status === 401) {
      setNeedsToken(true);
      setError("The server rejected the API token. Enter a valid one.");
    } else {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const refresh = useCallback(async () => {
    try {
      setScenes(await listServerScenes());
      setError("");
    } catch (err) {
      fail(err);
    }
  }, []);

  useEffect(() => {
    if (!needsToken) {
      refresh();
    }
  }, [needsToken, refresh]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const onSubmitToken = () => {
    if (!token.trim()) {
      return;
    }
    setServerScenesToken(token.trim());
    setError("");
    setNeedsToken(false);
  };

  const onSave = () =>
    run(async () => {
      const trimmed = name.trim();
      if (!trimmed) {
        setError("Enter a name for the scene.");
        return;
      }
      await saveServerScene(trimmed, getSceneJson());
      onClose();
    });

  const onOpen = (sceneName: string) =>
    run(async () => {
      await applyScene(await loadServerScene(sceneName));
      onClose();
    });

  const onDelete = (sceneName: string) =>
    run(async () => {
      await deleteServerScene(sceneName);
      await refresh();
    });

  return (
    <Dialog
      onCloseRequest={onClose}
      title={mode === "save" ? "Save to server" : "Open from server"}
      size="small"
    >
      <div className="ServerScenesDialog">
        {error && <p className="ServerScenesDialog__error">{error}</p>}

        {needsToken ? (
          <>
            <p>
              Saving scenes on your server requires its API token. On StartOS,
              run the service's <b>Show API Token</b> action and paste the token
              here — your browser will remember it.
            </p>
            <TextField
              value={token}
              onChange={setToken}
              label="API token"
              isRedacted
              fullWidth
              selectOnRender
              onKeyDown={(event) => event.key === "Enter" && onSubmitToken()}
            />
            <FilledButton
              className="ServerScenesDialog__submit"
              label="Continue"
              onClick={onSubmitToken}
            />
          </>
        ) : (
          <>
            {mode === "save" && (
              <>
                <TextField
                  value={name}
                  onChange={setName}
                  label="Scene name"
                  placeholder="my drawing"
                  fullWidth
                  selectOnRender
                  onKeyDown={(event) => event.key === "Enter" && onSave()}
                />
                <FilledButton
                  className="ServerScenesDialog__submit"
                  label="Save"
                  status={busy ? "loading" : null}
                  onClick={onSave}
                />
              </>
            )}

            {scenes && scenes.length > 0 && (
              <div className="ServerScenesDialog__list">
                {mode === "save" && (
                  <p>Saving over an existing scene replaces it:</p>
                )}
                {scenes.map((scene) => (
                  <div className="ServerScenesDialog__scene" key={scene.name}>
                    <button
                      type="button"
                      className="ServerScenesDialog__scene-name"
                      disabled={busy}
                      onClick={() =>
                        mode === "open"
                          ? onOpen(scene.name)
                          : setName(scene.name)
                      }
                    >
                      {scene.name}
                      <span className="ServerScenesDialog__scene-meta">
                        {new Date(scene.modified).toLocaleString()}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ServerScenesDialog__scene-delete"
                      aria-label={`Delete ${scene.name}`}
                      title="Delete"
                      disabled={busy}
                      onClick={() => onDelete(scene.name)}
                    >
                      {TrashIcon}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {mode === "open" && scenes && scenes.length === 0 && (
              <p>No scenes saved on the server yet.</p>
            )}
            {mode === "open" && scenes === null && !error && <p>Loading…</p>}
          </>
        )}
      </div>
    </Dialog>
  );
};
