import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, STATUS_LABELS, STATUS_TAG } from "../api.js";
import { Blueprint, Kicker, primaryBtn } from "../ui.jsx";
import CalendarStrip from "../components/CalendarStrip.jsx";

const FILTERS = ["All", "applied", "screening_call", "interview", "offer", "rejected"];
const LIVE = ["screening_call", "interview", "offer"];

export default function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [cvCount, setCvCount] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    api.applications().then(setApps).catch((e) => setError(e.message));
    api.cvs().then((cvs) => setCvCount(cvs.length)).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      const haystack = `${a.company} ${a.role} ${a.cv_version?.file_name || ""}`.toLowerCase();
      return (!q || haystack.includes(q)) && (filter === "All" || a.status === filter);
    });
  }, [apps, query, filter]);

  const replied = apps.filter((a) => a.status !== "applied" && a.status !== "no_response").length;
  const stats = [
    { label: "Applications", value: apps.length },
    { label: "Live processes", value: apps.filter((a) => LIVE.includes(a.status)).length },
    { label: "CV versions", value: cvCount },
    { label: "Reply rate", value: apps.length ? `${Math.round((replied / apps.length) * 100)}%` : "—" },
  ];

  return (
    <main style={{ flex: 1, padding: "40px 28px 64px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 28 }}>
        <div>
          <Kicker>Sheet 03 — Applications</Kicker>
          <h1 style={{ fontSize: 44, margin: 0 }}>My applications</h1>
        </div>
        <button className="btn btn-primary blueprint" onClick={() => navigate("/applications/new")} style={primaryBtn}>
          <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
          Log an application
        </button>
      </div>

      {error && <div style={{ marginBottom: 20, fontSize: 13, color: "var(--color-accent-800)" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--color-divider)", marginBottom: 30 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: 20, borderRight: "1px solid var(--color-divider)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 36, lineHeight: 1.1, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <CalendarStrip applications={apps} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Search company, role or CV file"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 300 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                className="btn btn-secondary"
                onClick={() => setFilter(f)}
                style={{
                  fontSize: 12,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  background: on ? "var(--color-accent)" : "transparent",
                  color: on ? "var(--color-bg)" : "var(--color-text)",
                  borderColor: on ? "var(--color-accent)" : "var(--color-divider)",
                }}
              >
                {f === "All" ? "All" : STATUS_LABELS[f]}
              </button>
            );
          })}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
          {visible.length} of {apps.length} records
        </span>
      </div>

      <Blueprint style={{ padding: "20px 22px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Applied</th><th>Role</th><th>Company</th><th>CV version used</th><th>JD</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id}>
                <td style={{ fontFamily: "var(--font-heading)", whiteSpace: "nowrap" }}>{a.applied_on}</td>
                <td>{a.role}</td>
                <td style={{ color: "var(--color-neutral-700)" }}>{a.company}</td>
                <td style={{ color: "var(--color-neutral-700)" }}>{a.cv_version?.file_name || "—"}</td>
                <td>{a.posting_url ? <a href={a.posting_url} target="_blank" rel="noreferrer">posting</a> : "—"}</td>
                <td><span className={STATUS_TAG[a.status]}>{STATUS_LABELS[a.status]}</span></td>
                <td style={{ textAlign: "right" }}><Link to={`/applications/${a.id}`}>Open</Link></td>
              </tr>
            ))}
            {!visible.length && (
              <tr><td colSpan={7} style={{ color: "var(--color-neutral-600)", padding: "18px 8px" }}>No records yet. Log your first application.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>
    </main>
  );
}
