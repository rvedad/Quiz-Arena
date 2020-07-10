import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getUser } from "../../user.js";
import "./QuizResult.css";

export default function QuizResult() {
  const navigate = useNavigate();
  const user = getUser();
  const location = useLocation();
  const { result } = location.state || {};

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, []);

  if (!user) {
    return null;
  }

  if (!result) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="result-page">
      <div className="container">
        <div className="result-hero card">
          <p className="result-eyebrow">Quiz complete</p>
          <h1 className="result-score" style={{ color: "var(--orange)" }}>
            {result.score} pts
          </h1>
          <div className="result-actions">
            <Link to="/quiz/setup" className="btn btn-primary">
              Play again
            </Link>
            <Link to="/dashboard" className="btn btn-ghost">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
