import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Blueprint, Field, Kicker, primaryBtn, ErrorNote } from "../ui.jsx";
import { CheckBadge, Confetti } from "../components/SuccessBadge.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const TIPS = [
  "Postings get taken down — the pasted copy is the only one you will still have in October.",
  "Recruiters quote the JD back at you on the phone screen.",
  "Comparing JDs shows which CV version keeps getting replies.",
];

export default function NewApplication() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [form, setForm] = useState({
    role: "", company: "", location: "", source: "", posting_url: "",
    jd_title: "", jd_text: "", applied_on: today(), cv_version_id: "", remind_after_days: 10,
  });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.cvs().then((list) => {
      setCvs(list);
      const def = list.find((c) => c.is_default) || list[0];
      if (def) setForm((f) => ({ ...f, cv_version_id: def.id }));
    }).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setProgress(15);
    try {
      let cvId = form.cv_version_id || null;
      if (file) {
        setProgress(40);
        const uploaded = await api.uploadCv(file, form.role ? `For ${form.company}` : "New version", "", false);
        cvId = uploaded.id;
      }
      setProgress(75);
      const created = await api.createApplication({
        ...form,
        cv_version_id: cvId,
        remind_after_days: Number(form.remind_after_days) || 10,
      });
      setProgress(100);
      setDone(created);
    } catch (err) {
      setError(err.message);
      setProgress(0);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "64px 32px", position: "relative", overflow: "hidden" }}>
        <Confetti />
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 540 }}>
          <CheckBadge />
          <Kicker>Sheet 05 — Filed</Kicker>
          <h1 style={{ fontSize: 50, margin: "10px 0 12px", animation: "fadeUp .5s ease .6s both" }}>Logged and filed.</h1>
          <p style={{ color: "var(--color-neutral-700)", fontSize: 16, animation: "fadeUp .5s ease .72s both" }}>
            The job description, the link and the exact CV file are stored together. If they call, open the record and you will know what they read.
          </p>
          <Blueprint style={{ display: "inline-grid", gridTemplateColumns: "1fr 1fr", margin: "30px 0 34px", animation: "fadeUp .5s ease .84s both" }}>
            <div style={{ padding: "14px 24px", borderRight: "1px solid var(--color-divider)", textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>Record</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>{done.reference}</div>
            </div>
            <div style={{ padding: "14px 24px", textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>CV attached</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>{done.cv_version?.file_name || "—"}</div>
            </div>
          </Blueprint>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", animation: "fadeUp .5s ease .96s both" }}>
            <button className="btn btn-primary blueprint" onClick={() => navigate("/applications")} style={{ ...primaryBtn, height: 42 }}>
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              Back to my applications
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(`/applications/${done.id}`)} style={{ height: 42, paddingInline: 22 }}>
              Open the record
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, padding: "40px 28px 64px", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
      <Kicker>Sheet 04 — New record</Kicker>
      <h1 style={{ fontSize: 44, margin: "0 0 4px" }}>Log an application</h1>
      <p style={{ color: "var(--color-neutral-700)", marginBottom: 34 }}>
        Paste the job description before the posting disappears, and attach the exact CV you sent.
      </p>

      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 30, alignItems: "start" }}>
        <Blueprint style={{ padding: 28 }}>
          <ErrorNote>{error}</ErrorNote>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "0 0 16px" }}>
            <Field label="Role" value={form.role} onChange={set("role")} placeholder="Backend Engineer" required />
            <Field label="Company" value={form.company} onChange={set("company")} placeholder="Halden Logistics" required />
            <Field label="Location" value={form.location} onChange={set("location")} placeholder="Dubai · Hybrid" />
            <Field label="Applied on" type="date" value={form.applied_on} onChange={set("applied_on")} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Field label="Link to the posting" value={form.posting_url} onChange={set("posting_url")} placeholder="https://…" />
          </div>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Job description — paste it here</label>
            <textarea
              className="input"
              style={{ minHeight: 150 }}
              value={form.jd_text}
              onChange={set("jd_text")}
              placeholder="Paste the full JD text. This is what drives the keyword diff, and what you'll re-read before a phone screen."
            />
          </div>

          <div style={{ border: "1px dashed var(--color-accent-400)", background: "var(--color-accent-100)", padding: "30px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Attach the CV you sent</div>
            <div style={{ fontSize: 13, color: "var(--color-accent-800)", margin: "6px 0 16px" }}>
              PDF or DOCX — or reuse a version from your library
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <label className="btn btn-secondary" style={{ cursor: "pointer", background: "var(--color-bg)" }}>
                {file ? file.name : "Upload new"}
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0] || null)} style={{ display: "none" }} />
              </label>
              <select className="input" value={form.cv_version_id} onChange={set("cv_version_id")} style={{ width: 240, background: "var(--color-bg)" }}>
                <option value="">No existing version</option>
                {cvs.map((c) => <option key={c.id} value={c.id}>{c.file_name}</option>)}
              </select>
            </div>
          </div>

          {(busy || progress > 0) && (
            <div style={{ height: 3, background: "var(--color-neutral-200)", marginTop: 18 }}>
              <div style={{ height: "100%", background: "var(--color-accent)", width: `${progress}%`, transition: "width .25s linear" }} />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 24 }}>
            <label className="radio">
              <input
                type="checkbox"
                checked={Number(form.remind_after_days) > 0}
                onChange={(e) => setForm({ ...form, remind_after_days: e.target.checked ? 10 : 0 })}
              />
              <span className="dot" />
              <span style={{ fontSize: 13 }}>Remind me if no reply in 10 days</span>
            </label>
            <button className="btn btn-primary blueprint" disabled={busy} style={primaryBtn}>
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              {busy ? "Saving…" : "Save record"}
            </button>
          </div>
        </Blueprint>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Blueprint className="card" style={{ padding: 20, gap: 10 }}>
            <div className="card-kicker">Why paste the JD</div>
            {TIPS.map((t) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, alignItems: "baseline", fontSize: 13, color: "var(--color-neutral-700)" }}>
                <span style={{ width: 6, height: 6, background: "var(--color-accent)" }} />
                <span>{t}</span>
              </div>
            ))}
          </Blueprint>
          <Blueprint className="card" style={{ padding: 20, gap: 10 }}>
            <div className="card-kicker">Your CV library</div>
            {cvs.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, borderBottom: "1px solid var(--color-divider)", paddingBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{c.file_name}</span>
                <span style={{ color: "var(--color-neutral-600)" }}>{c.label}</span>
              </div>
            ))}
            {!cvs.length && <span style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>Nothing uploaded yet.</span>}
          </Blueprint>
        </aside>
      </form>
    </main>
  );
}
