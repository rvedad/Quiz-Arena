import { getUser } from "../../user.js";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api.js";
import TimerRing from "../../components/TimerRing/TimerRing.jsx";
import "./QuizPlay.css";

const OPTIONS = ["A", "B", "C", "D"];

export default function QuizPlay() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  const { questions } = location.state || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs so every callback always sees the latest values — no stale closures
  const currentIdxRef = useRef(0);
  const answersRef = useRef([]);
  const answeredRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!questions?.length) {
      navigate("/quiz/setup");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }
  }, []);

  if (!user || !questions?.length) {
    return null;
  }

  const total = questions.length;
  // Always derive the current question from the ref, not from state
  const question = questions[currentIdxRef.current];
  const progress = (currentIdxRef.current / total) * 100;

  const optionValues = {
    A: question.option_a,
    B: question.option_b,
    C: question.option_c,
    D: question.option_d,
  };

  function recordAnswer(letter) {
    if (answeredRef.current) return;
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Read question from ref — always current, never stale
    const currentQuestion = questions[currentIdxRef.current];

    answeredRef.current = true;
    setAnswered(true);
    setSelected(letter);

    answersRef.current.push({
      question_id: currentQuestion.id,
      selected_option: letter,
      time_taken_sec: timeTaken,
    });

    setTimeout(() => advance(), 900);
  }

  function handleExpire() {
    if (answeredRef.current) return;
    const currentQuestion = questions[currentIdxRef.current];

    answeredRef.current = true;
    setAnswered(true);

    answersRef.current.push({
      question_id: currentQuestion.id,
      selected_option: null,
      time_taken_sec: 15,
    });

    setTimeout(() => advance(), 900);
  }

  async function advance() {
    const nextIdx = currentIdxRef.current + 1;

    if (nextIdx < total) {
      currentIdxRef.current = nextIdx;
      answeredRef.current = false;
      startTimeRef.current = Date.now();

      setCurrentIdx(nextIdx);
      setSelected(null);
      setAnswered(false);
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest("/quiz/submit", {
        method: "POST",
        user,
        body: { questions, answers: answersRef.current },
      });
      navigate("/quiz/result", { state: { result } });
    } catch {
      navigate("/dashboard");
    }
  }

  return (
    <div className="play-page">
      <div className="container play-container">
        <div className="play-progress-bar">
          <div
            className="play-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="play-counter">
          {currentIdx + 1} / {total}
        </p>

        <div className="play-main">
          <div className="play-timer-wrap">
            <TimerRing
              duration={15}
              onExpire={handleExpire}
              isPaused={answered || submitting}
              resetKey={currentIdx}
            />
          </div>

          <div className="card play-card">
            <h2 className="play-question">{question.question_text}</h2>

            <div className="play-options">
              {OPTIONS.map((letter) => (
                <button
                  key={letter}
                  className={`option-btn ${selected === letter ? "option-selected" : ""}`}
                  onClick={() => recordAnswer(letter)}
                  disabled={answered}
                >
                  <span className="option-letter">{letter}</span>
                  <span className="option-text">{optionValues[letter]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {submitting && <p className="play-submitting">Submitting quiz…</p>}
      </div>
    </div>
  );
}