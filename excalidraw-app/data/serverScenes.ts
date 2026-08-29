/**
 * Client for the self-hosted scenes API (the StartOS package's sidecar,
 * reverse-proxied same-origin at /api — see startos/api/server.mjs). Lets the
 * app save/load .excalidraw scenes on the hosting server. The API is absent
 * on excalidraw.com and in plain dev builds; callers must check
 * isServerScenesAvailable() first.
 */

const TOKEN_STORAGE_KEY = "excalidraw-server-scenes-token";

export type ServerSceneInfo = {
  name: string;
  size: number;
  modified: string;
};

export class ServerScenesError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const getServerScenesToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const setServerScenesToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // storage unavailable — the token just won't be remembered
  }
};

const request = async (path: string, init: RequestInit = {}) => {
  const token = getServerScenesToken();
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    let message = `request failed (${response.status})`;
    try {
      message = (await response.json()).error || message;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ServerScenesError(response.status, message);
  }
  return response;
};

export const isServerScenesAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/health", {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
};

export const listServerScenes = async (): Promise<ServerSceneInfo[]> => {
  return (await request("scenes")).json();
};

export const loadServerScene = async (name: string): Promise<Blob> => {
  return (await request(`scenes/${encodeURIComponent(name)}`)).blob();
};

export const saveServerScene = async (name: string, sceneJson: string) => {
  await request(`scenes/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: sceneJson,
  });
};

export const deleteServerScene = async (name: string) => {
  await request(`scenes/${encodeURIComponent(name)}`, { method: "DELETE" });
};
