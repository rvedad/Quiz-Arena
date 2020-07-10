import { getUser } from "../../user.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api.js";
import "./QuizSetup.css";

export default function QuizSetup() {
  const user = getUser();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
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

  async function handleStart(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = { count: 10 };
      if (categoryId) body.category_id = Number(categoryId);
      const data = await apiRequest("/quiz/generate", {
        method: "POST",
        user,
        body,
      });
      navigate("/quiz/play", { state: { questions: data.questions } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="setup-page">
      <div className="container">
        <h1 className="setup-title">Set up your quiz</h1>
        <p className="setup-sub">Choose a category and start playing.</p>

        <form className="card setup-card" onSubmit={handleStart}>
          <div className="setup-field">
            <label className="label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All categories (mixed)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-block setup-submit"
            disabled={loading}
          >
            {loading ? "Generating quiz…" : "Start quiz"}
          </button>
        </form>
      </div>
    </div>
  );
}
