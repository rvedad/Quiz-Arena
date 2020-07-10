import { getUser } from "../../user.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api.js";
import "./Leaderboard.css";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const user = getUser();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelected] = useState("global");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    apiRequest("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (!user) {
    return null;
  }

  useEffect(() => {
    setLoading(true);
    setError("");
    const path =
      selectedCategory === "global"
        ? "/leaderboard/global"
        : `/leaderboard/category/${selectedCategory}`;
    apiRequest(path)
      .then(setRankings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="lb-page">
      <div className="container">
        <p className="lb-eyebrow">Rankings</p>
        <h1 className="lb-title">Leaderboard</h1>

        <div className="lb-filters">
          <button
            className={`filter-pill ${selectedCategory === "global" ? "filter-active" : ""}`}
            onClick={() => setSelected("global")}
          >
            Global
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`filter-pill ${selectedCategory === String(c.id) ? "filter-active" : ""}`}
              onClick={() => setSelected(String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && rankings.length === 0 && (
          <p className="muted">No scores yet. Be the first!</p>
        )}

        {!loading && !error && rankings.length > 0 && (
          <div className="card table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Rank</th>
                  <th>Player</th>
                  <th style={{ textAlign: "right" }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => {
                  const isMe = user && r.id === user.id;
                  const pts =
                    selectedCategory === "global" ? r.total_points : r.points;
                  return (
                    <tr key={r.id} className={isMe ? "row-me" : ""}>
                      <td>
                        <span className="rank-cell">
                          {r.rank <= 3 ? MEDALS[r.rank - 1] : `#${r.rank}`}
                        </span>
                      </td>
                      <td className="cell-strong">
                        {r.username}
                        {isMe && <span className="you-tag">you</span>}
                      </td>
                      <td className="pts-cell">{pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
