// Shared HTTP helpers: JWT storage, auth header and one request function used by the new services.

export const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "pathwise_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => (token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY));
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = (extra = {}) => {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
};

export function handleUnauthorized() {
  clearToken();
  localStorage.removeItem("pathwise_session");
  if (!window.location.pathname.startsWith("/login")) window.location.assign("/login");
}

const parse = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

/** JSON request that throws Error(message) on failure. Pass `body` as object, FormData or undefined. */
export async function request(path, { method = "GET", body, timeoutMs = 45000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  let response;
  try {
    response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method,
      headers: authHeaders(isForm || body === undefined ? {} : { "Content-Type": "application/json" }),
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Please log in again.");
  }
  const data = await parse(response);
  if (!response.ok) throw new Error(data?.message || data?.error || (typeof data === "string" && data) || `Request failed (${response.status})`);
  return data;
}

/** Downloads a file response (PDF / CSV / ICS) with the auth header and triggers a browser save. */
export async function download(path, fallbackName) {
  let response;
  try {
    response = await fetch(`${BACKEND_BASE_URL}${path}`, { headers: authHeaders() });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Please log in again.");
  }
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const blob = await response.blob();
  const match = /filename="?([^"]+)"?/.exec(response.headers.get("Content-Disposition") || "");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = match ? match[1] : fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
