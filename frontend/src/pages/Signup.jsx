import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Blueprint, ErrorNote, Field, Kicker } from "../ui.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    setBusy(true);
    setError("");
    try {
      await signup({ full_name: form.full_name, email: form.email, password: form.password });
      navigate("/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "56px 32px", fontFamily: "var(--font-body)" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Kicker>Sheet 02 — Registration</Kicker>
        <h1 style={{ fontSize: 44, margin: "0 0 6px" }}>Start your ledger</h1>
        <p style={{ color: "var(--color-neutral-700)", marginBottom: 28 }}>Your applications stay private to you. Nothing is shared with employers.</p>
        <Blueprint as="form" className="card" onSubmit={submit} style={{ padding: 28, gap: 18 }}>
          <ErrorNote>{error}</ErrorNote>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Full name" value={form.full_name} onChange={set("full_name")} required />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
            <Field label="Password" type="password" value={form.password} onChange={set("password")} required />
            <Field label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} required />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 4 }}>
            <Link to="/login" style={{ fontSize: 13 }}>I already have an account</Link>
            <button className="btn btn-primary blueprint" disabled={busy} style={{ height: 42, paddingInline: 26, letterSpacing: ".06em", textTransform: "uppercase" }}>
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              {busy ? "Creating…" : "Create account"}
            </button>
          </div>
        </Blueprint>
      </div>
    </main>
  );
}
