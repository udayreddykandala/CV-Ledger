import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Blueprint, Kicker, primaryBtn } from "../ui.jsx";

const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function CvLibrary() {
  const [cvs, setCvs] = useState([]);
  const [apps, setApps] = useState([]);
  const [label, setLabel] = useState("");
  const [terms, setTerms] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api.cvs().then(setCvs).catch((e) => setError(e.message));
    api.applications().then(setApps).catch(() => {});
  };
  useEffect(load, []);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await api.uploadCv(file, label || file.name, terms, !cvs.length);
      setLabel("");
      setTerms("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const usage = (id) => apps.filter((a) => a.cv_version?.id === id);

  return (
    <main style={{ flex: 1, padding: "40px 28px 64px", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
      <Kicker>Sheet 06 — Library</Kicker>
      <h1 style={{ fontSize: 44, margin: "0 0 24px" }}>My CV versions</h1>

      <Blueprint style={{ padding: 22, marginBottom: 34, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end" }}>
        <div className="field">
          <label>Label for the next upload</label>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Infra weighted" />
        </div>
        <div className="field">
          <label>Terms this version covers — comma separated, used by the keyword diff</label>
          <input className="input" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Python, FastAPI, PostgreSQL, partitioning" />
        </div>
        <label className="btn btn-primary blueprint" style={{ ...primaryBtn, cursor: "pointer" }}>
          <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
          {busy ? "Uploading…" : "Upload a version"}
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => upload(e.target.files[0])} style={{ display: "none" }} />
        </label>
      </Blueprint>

      {error && <div style={{ marginBottom: 20, fontSize: 13, color: "var(--color-accent-800)" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 26 }}>
        {cvs.map((c) => {
          const used = usage(c.id);
          return (
            <Blueprint key={c.id} className="card" style={{ padding: 20, gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span className="card-kicker">{c.is_default ? "Current default" : c.label}</span>
                <span className="tag tag-neutral">{kb(c.file_size)}</span>
              </div>
              <div className="card-title">{c.file_name}</div>
              <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Uploaded {c.created_at?.slice(0, 10)}</div>
              <div style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 10, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                Sent to
              </div>
              <div style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>
                {used.length ? used.map((a) => a.company).join(", ") : "Not sent yet"}
              </div>
              {c.terms && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {c.terms.split(",").slice(0, 6).map((t) => <span key={t} className="tag tag-accent">{t.trim()}</span>)}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, paddingTop: 6 }}>
                <span style={{ color: "var(--color-neutral-600)" }}>
                  {used.length} application{used.length === 1 ? "" : "s"}
                </span>
                <a href={api.cvDownloadUrl(c.id)}>Download</a>
              </div>
            </Blueprint>
          );
        })}
      </div>
    </main>
  );
}
