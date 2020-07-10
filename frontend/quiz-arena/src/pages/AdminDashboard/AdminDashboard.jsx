import { useNavigate } from "react-router-dom";
import { getUser } from "../../user.js";
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api.js";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate("/login");
      return;
    }
    apiRequest("/admin/stats", { user })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!user || !user.is_admin) {
    return null;
  }

  const cards = stats
    ? [
        {
          label: "Total players",
          value: stats.total_users,
          color: "var(--orange)",
        },
        {
          label: "Categories",
          value: stats.total_categories,
          color: "var(--gold)",
        },
        {
          label: "Questions",
          value: stats.total_questions,
          color: "var(--green)",
        },
        {
          label: "Quizzes played",
          value: stats.total_quizzes_played,
          color: "var(--midnight)",
        },
      ]
    : [];

  return (
    <div className="admin-dash">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Platform-wide activity at a glance.</p>

      {loading && <p className="muted">Loading stats…</p>}
      {error && <p className="error-text">{error}</p>}

      {stats && (
        <div className="admin-stats-grid">
          {cards.map((c) => (
            <div key={c.label} className="card admin-stat-card">
              <p className="admin-stat-value" style={{ color: c.color }}>
                {c.value}
              </p>
              <p className="admin-stat-label">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
