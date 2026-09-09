"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface PoryFile {
  id: string;
  owner_id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  sha256: string;
  created_at: string;
}

export interface PoryUser {
  id: string;
  email: string;
  created_at: string;
}

export interface ShareInfo {
  id: string;
  file_id: string;
  token: string;
  url: string;
  expires_at?: string;
  revoked: boolean;
  created_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `request failed (${res.status})`);
  return body as T;
}

export const api = {
  me: () => req<PoryUser>("/me"),
  register: (email: string, password: string) =>
    req<PoryUser>("/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    req<PoryUser>("/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => fetch(`${API}/logout`, { method: "POST", credentials: "include" }),
  files: () => req<PoryFile[]>("/files"),
  deleteFile: (id: string) =>
    fetch(`${API}/files/${id}`, { method: "DELETE", credentials: "include" }).then((r) => {
      if (!r.ok) throw new Error("delete failed");
    }),
  share: (id: string, expiresInSeconds?: number) =>
    req<ShareInfo>(`/files/${id}/shares`, {
      method: "POST",
      body: JSON.stringify(expiresInSeconds ? { expires_in_seconds: expiresInSeconds } : {}),
    }),
  downloadUrl: (id: string) => `${API}/files/${id}`,
  shareUrl: (token: string) => `${API}/s/${token}`,
};

interface AuthCtx {
  user: PoryUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PoryUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <Ctx.Provider value={{ user, loading, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
