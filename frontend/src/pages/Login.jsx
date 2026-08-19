import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { ErrorNote, Field } from "../ui.jsx";

const POINTS = [
  { value: "One record", label: "per application" },
  { value: "JD saved", label: "before the posting expires" },
  { value: "Every version", label: "of your CV, kept" },
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
    <main className="auth" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 1fr", fontFamily: "var(--font-body)" }}>
      <section
        className="auth-pitch"
        style={{
          background: "var(--color-accent-900)",
          color: "var(--color-bg)",
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 48,
        }}
      <form
          onSubmit={submit}
          style={{ width: "100%", maxWidth: 400, padding: "34px 4px", display: "flex", flexDirection: "column", gap: 20 }}
        >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, letterSpacing: ".01em" }}>CV LEDGER</span>
          <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-300)" }}>
            Personal job log
          </span>
        </div>

        <div style={{ maxWidth: 470 }}>
          <h1 className="auth-h1" style={{ fontSize: 58, lineHeight: 1.02, margin: "0 0 20px", textWrap: "balance" }}>
            Which CV did you send them?
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 420, color: "var(--color-accent-200)", textWrap: "pretty" }}>
            Keep every application in one place — the CV version you used, the job description, the link, and where it got to.
            So when the phone rings you already know.
          </p>
        </div>

        <div className="auth-points" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {POINTS.map((p) => (
            <div key={p.value} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 12, alignItems: "baseline" }}>
              <span style={{ width: 7, height: 7, background: "var(--color-accent-300)", marginTop: 7 }} />
              <span style={{ fontSize: 15 }}>
                <strong style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, letterSpacing: ".01em" }}>{p.value}</strong>
                <span style={{ color: "var(--color-accent-200)" }}> — {p.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-form" style={{ display: "grid", placeItems: "center", padding: "48px 32px" }}>
        <Blueprint
          as="form"
          className="card"
          onSubmit={submit}
          style={{ width: "100%", maxWidth: 400, padding: "34px 30px", gap: 20, background: "var(--color-bg)" }}
        >
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
              Welcome back
            </div>
            <h2 style={{ fontSize: 34, margin: "6px 0 0", lineHeight: 1 }}>Log in</h2>
          </div>
          <ErrorNote>{error}</ErrorNote>
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <button
            className="btn btn-primary btn-block blueprint"
            disabled={busy}
            style={{ height: 48, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 14, marginTop: 4 }}
          >
            <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
            {busy ? "Logging in…" : "Log in"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderTop: "1px solid var(--color-divider)", paddingTop: 16 }}>
            <span style={{ color: "var(--color-neutral-600)" }}>New here?</span>
            <Link to="/signup" style={{ fontFamily: "var(--font-heading)", fontSize: 15, letterSpacing: ".02em" }}>Create an account</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
