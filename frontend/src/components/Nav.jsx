import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const link = ({ isActive }) => ({
  fontFamily: "var(--font-heading)",
  fontSize: 14,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: isActive ? "var(--color-accent)" : "inherit",
  textDecoration: "none",
});

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav" style={{ borderBottom: "1px solid var(--color-divider)", padding: "14px 28px", gap: 28 }}>
      <div className="nav-brand" style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span>CV LEDGER</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
          {user?.full_name}
        </span>
      </div>
      <nav style={{ display: "flex", gap: 22, alignItems: "center" }}>
        <NavLink to="/applications" style={link}>Applications</NavLink>
        <NavLink to="/cvs" style={link}>CV library</NavLink>
        <NavLink to="/profile" style={link}>Profile</NavLink>
      </nav>
      <button className="btn btn-secondary" onClick={() => logout().then(() => navigate("/login"))}>
        Log out
      </button>
    </header>
  );
}
