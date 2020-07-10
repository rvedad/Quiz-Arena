import { getUser } from "../../user.js";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api.js";
import "./Dashboard.css";

export default function Dashboard() {
  const user = getUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    Promise.all([
      apiRequest("/auth/profile", { user }),
      apiRequest("/quiz/history?limit=20", { user }),
    ])
      .then(([p, h]) => {
        setProfile(p);
        setHistory(h);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return null;
  }

  if (loading)
    return (
      <div className="container" style={{ padding: "64px 0" }}>
        <p className="muted">Loading…</p>
      </div>
    );

  if (error)
    return (
      <div className="container" style={{ padding: "64px 0" }}>
        <p className="error-text">{error}</p>
      </div>
    );

  const stats = [
    {
      label: "Total points",
      value: profile.total_points,
      color: "var(--orange)",
    },
    {
      label: "Global rank",
      value: `#${profile.global_rank}`,
      color: "var(--gold)",
    },
    {
      label: "Quizzes completed",
      value: profile.quizzes_completed,
      color: "var(--green)",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-header">
          <div>
            <p className="dash-eyebrow">Dashboard</p>
            <h1 className="dash-title">Hey, {profile.username} 👋</h1>
            <p className="dash-sub">
              Playing since{" "}
              {new Date(profile.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Link to="/quiz/setup" className="btn btn-primary btn-lg">
            Start a quiz
          </Link>
        </div>

        <div className="dash-stats">
          {stats.map((s) => (
            <div key={s.label} className="card stat-card">
              <p className="stat-value" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title">Quiz history</h2>

        {history.length === 0 && (
          <p className="muted">No quizzes yet — start one above!</p>
        )}

        {history.length > 0 && (
          <div className="card table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="cell-dim">
                      {new Date(h.completed_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="cell-strong">
                      {h.category_name || "Mixed"}
                    </td>
                    <td style={{ color: "var(--orange)", fontWeight: 700 }}>
                      {h.score} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
