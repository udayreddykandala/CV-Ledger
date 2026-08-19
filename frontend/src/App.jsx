import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import { useAuth } from "./auth.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Applications from "./pages/Applications.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import NewApplication from "./pages/NewApplication.jsx";
import CvLibrary from "./pages/CvLibrary.jsx";
import Profile from "./pages/Profile.jsx";

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
      <Nav />
      {children}
      <footer
        style={{
          borderTop: "1px solid var(--color-divider)",
          padding: "16px 28px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--color-neutral-600)",
        }}
      >
        <span>CV Ledger — private job log</span>
        <span>React · FastAPI · PostgreSQL</span>
      </footer>
    </div>
  );
}

function Private({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div style={{ padding: 40, fontFamily: "var(--font-body)" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/applications" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/applications" replace /> : <Signup />} />
      <Route path="/applications" element={<Private><Applications /></Private>} />
      <Route path="/applications/new" element={<Private><NewApplication /></Private>} />
      <Route path="/applications/:id" element={<Private><ApplicationDetail /></Private>} />
      <Route path="/cvs" element={<Private><CvLibrary /></Private>} />
      <Route path="/profile" element={<Private><Profile /></Private>} />
      <Route path="*" element={<Navigate to={user ? "/applications" : "/login"} replace />} />
    </Routes>
  );
}
