import React, { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Blueprint, Field, Kicker, primaryBtn } from "../ui.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    target_roles: user?.target_roles || "",
  });
  const [saved, setSaved] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const updated = await api.updateProfile(form);
    setUser(updated);
    setSaved("Saved");
    setTimeout(() => setSaved(""), 1800);
  };

  return (
    <main style={{ flex: 1, padding: "40px 28px 64px", maxWidth: 900, width: "100%", margin: "0 auto" }}>
      <Kicker>Sheet 07 — Profile</Kicker>
      <h1 style={{ fontSize: 44, margin: "0 0 34px" }}>Profile &amp; settings</h1>
      <form onSubmit={save} style={{ display: "grid", gap: 26 }}>
        <Blueprint className="card" style={{ padding: 26, gap: 18 }}>
          <div className="card-kicker">Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Full name" value={form.full_name} onChange={set("full_name")} />
            <Field label="Email" value={user?.email || ""} disabled />
            <Field label="Phone" value={form.phone} onChange={set("phone")} />
            <Field label="Based in" value={form.location} onChange={set("location")} />
          </div>
          <Field label="Target roles" value={form.target_roles} onChange={set("target_roles")} />
        </Blueprint>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--color-accent-700)" }}>{saved}</span>
          <button className="btn btn-primary blueprint" style={primaryBtn}>
            <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
            Save changes
          </button>
        </div>
      </form>
    </main>
  );
}
