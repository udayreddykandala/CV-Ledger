import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Blueprint, ErrorNote, Field, Kicker } from "../ui.jsx";

const STATS = [
  { value: "1 record", label: "Per application" },
  { value: "JD saved", label: "Before it expires" },
  { value: "Every version", label: "Of your CV" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 1fr", fontFamily: "var(--font-body)" }}>
      <section style={{ borderRight: "1px solid var(--color-divider)", padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 48 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22 }}>CV LEDGER</span>
          <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>Personal job log</span>
        </div>
        <div style={{ maxWidth: 470 }}>
          <Kicker>Sheet 01 — Access</Kicker>
          <h1 style={{ fontSize: 58, lineHeight: 0.98, margin: "0 0 18px" }}>Which CV<br />did you send<br />them?</h1>
          <p style={{ fontSize: 16, maxWidth: 410, color: "var(--color-neutral-700)" }}>
            Keep every application in one place: the CV version you used, the job description, the link, and where it got to.
            So when the phone rings you already know.
          </p>
        </div>
        <Blueprint style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "18px 16px", borderRight: "1px solid var(--color-divider)" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 30, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </Blueprint>
      </section>

      <section style={{ display: "grid", placeItems: "center", padding: "48px 32px" }}>
        <Blueprint as="form" className="card" onSubmit={submit} style={{ width: "100%", maxWidth: 380, padding: 30, gap: 16 }}>
          <div>
            <div className="card-kicker">Welcome back</div>
            <h2 style={{ fontSize: 30, margin: "4px 0 0" }}>Log in</h2>
          </div>
          <ErrorNote>{error}</ErrorNote>
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn btn-primary btn-block blueprint" disabled={busy} style={{ height: 42, letterSpacing: ".06em", textTransform: "uppercase" }}>
            <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
            {busy ? "Logging in…" : "Log in"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: 4 }}>
            <Link to="/signup">Create an account</Link>
          </div>
        </Blueprint>
      </section>
    </main>
  );
}
