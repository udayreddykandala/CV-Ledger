const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const KEY = "cvledger_token";

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

async function request(path, { method = "GET", json, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(BASE + path, { method, headers, body });
  if (res.status === 401) {
    clearToken();
    throw new Error("Session expired — log in again");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const payload = await res.json();
      detail = payload.detail || detail;
    } catch {}
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: async (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) throw new Error("Incorrect email or password");
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },
  signup: async (payload) => {
    const data = await request("/api/auth/signup", { method: "POST", json: payload });
    setToken(data.access_token);
    return data;
  },
  logout: async () => {
    try { await request("/api/auth/logout", { method: "POST" }); } finally { clearToken(); }
  },
  me: () => request("/api/auth/me"),
  updateProfile: (payload) => request("/api/users/me", { method: "PATCH", json: payload }),

  cvs: () => request("/api/cvs"),
  uploadCv: (file, label, terms, isDefault) => {
    const form = new FormData();
    form.append("file", file);
    form.append("label", label || "Untitled version");
    form.append("terms", terms || "");
    form.append("is_default", isDefault ? "true" : "false");
    return request("/api/cvs", { method: "POST", form });
  },
  cvDownloadUrl: (id) => `${BASE}/api/cvs/${id}/download`,

  applications: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.status) qs.set("status", params.status);
    const tail = qs.toString();
    return request("/api/applications" + (tail ? "?" + tail : ""));
  },
  application: (id) => request(`/api/applications/${id}`),
  createApplication: (payload) => request("/api/applications", { method: "POST", json: payload }),
  updateApplication: (id, payload) => request(`/api/applications/${id}`, { method: "PATCH", json: payload }),
  addEvent: (id, payload) => request(`/api/applications/${id}/events`, { method: "POST", json: payload }),
};

export const STATUS_LABELS = {
  applied: "Applied",
  screening_call: "Screening call",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  no_response: "No response",
};

export const STATUS_TAG = {
  applied: "tag tag-neutral",
  screening_call: "tag tag-accent",
  interview: "tag tag-accent",
  offer: "tag tag-outline",
  rejected: "tag tag-neutral",
  no_response: "tag tag-neutral",
};
