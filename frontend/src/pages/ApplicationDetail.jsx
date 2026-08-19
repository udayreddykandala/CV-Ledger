import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, STATUS_LABELS } from "../api.js";
import { Blueprint, Kicker } from "../ui.jsx";
import KeywordDiff from "../components/KeywordDiff.jsx";

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.application(id).then((a) => { setApp(a); setNotes(a.notes || ""); }).catch((e) => setError(e.message));
  }, [id]);

  const setStatus = async (status) => {
    const updated = await api.updateApplication(id, { status });
    setApp(updated);
  };

  const saveNotes = async () => {
    const updated = await api.updateApplication(id, { notes });
    setApp(updated);
    setSaved("Saved");
    setTimeout(() => setSaved(""), 1800);
  };

  if (error) return <main style={{ padding: 40 }}>{error}</main>;
  if (!app) return <main style={{ padding: 40 }}>Loading…</main>;

  return (
    <main style={{ flex: 1, padding: "32px 28px 64px", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
      <Link to="/applications" style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>← All applications</Link>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, margin: "18px 0 30px" }}>
        <div>
          <Kicker>{app.reference} — logged {app.applied_on}</Kicker>
          <h1 style={{ fontSize: 42, margin: "0 0 4px" }}>{app.role}</h1>
          <div style={{ fontSize: 16, color: "var(--color-neutral-700)" }}>
            {[app.company, app.location, app.source].filter(Boolean).join(" · ")}
          </div>
        </div>
        {app.posting_url && (
          <a className="btn btn-secondary" href={app.posting_url} target="_blank" rel="noreferrer" style={{ height: 40 }}>
            Open job posting
          </a>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 30, alignItems: "start" }}>
        <Blueprint style={{ padding: "26px 28px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 12 }}>
            Job description — saved {app.applied_on}
          </div>
          <h3 style={{ margin: "0 0 14px" }}>{app.jd_title || app.role}</h3>
          <p style={{ color: "var(--color-neutral-800)", whiteSpace: "pre-wrap", marginBottom: 22 }}>{app.jd_text || "No JD saved for this record."}</p>

          <div style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 18, marginBottom: 20 }}>
            <KeywordDiff jdText={app.jd_text} cv={app.cv_version} />
          </div>

          <div style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>My notes</div>
              <span style={{ fontSize: 11, color: "var(--color-accent-700)" }}>{saved}</span>
            </div>
            <textarea className="input" style={{ minHeight: 84 }} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveNotes} />
          </div>
        </Blueprint>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Blueprint style={{ padding: 20, background: "var(--color-accent-100)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-accent-800)" }}>CV I sent them</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: "8px 0 2px" }}>{app.cv_version?.file_name || "No CV attached"}</div>
            <div style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{app.cv_version?.label}</div>
            {app.cv_version && (
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <a className="btn btn-secondary" href={api.cvDownloadUrl(app.cv_version.id)} style={{ background: "var(--color-bg)" }}>Download</a>
              </div>
            )}
          </Blueprint>

          <Blueprint className="card" style={{ padding: 20, gap: 12 }}>
            <div className="card-kicker">Where it stands</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <label key={value} className="radio" style={{ width: "100%", justifyContent: "flex-start" }}>
                  <input type="radio" name="status" checked={app.status === value} onChange={() => setStatus(value)} />
                  <span className="dot" />
                  <span style={{ fontSize: 14 }}>{label}</span>
                </label>
              ))}
            </div>
          </Blueprint>

          <Blueprint className="card" style={{ padding: 20, gap: 10 }}>
            <div className="card-kicker">Timeline</div>
            {app.events.map((ev) => (
              <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10, fontSize: 13, borderBottom: "1px solid var(--color-divider)", paddingBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent-700)" }}>{ev.happened_on}</span>
                <span style={{ color: "var(--color-neutral-800)" }}>{ev.label}</span>
              </div>
            ))}
          </Blueprint>
        </aside>
      </div>
    </main>
  );
}
