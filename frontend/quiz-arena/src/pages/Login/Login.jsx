import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api.js";
import { saveUser, getUser } from "../../user.js";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const user = getUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.is_admin ? "/admin" : "/dashboard");
      return;
    }
  }, []);

  if (user) {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveUser(data.user);
      navigate(data.user.is_admin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card card">
          <div className="auth-brand">
            QUIZ<span>ARENA</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary btn-block auth-btn"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
