import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, clearToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    await api.login(email, password);
    setUser(await api.me());
  };

  const signup = async (payload) => {
    await api.signup(payload);
    setUser(await api.me());
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
