import { useNavigate } from "react-router-dom";
import { getUser } from "../../user.js";
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api.js";
import Modal from "../../components/Modal/Modal.jsx";
import "./AdminQuestions.css";

export default function AdminQuestions() {
  const user = getUser();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editingQ, setEditingQ] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate("/login");
      return;
    }
    apiRequest("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (!user || !user.is_admin) {
    return null;
  }

  function loadQuestions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter) params.set("category_id", catFilter);

    apiRequest(`/questions?${params}`, { user })
      .then(setQuestions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(loadQuestions, 300);
    return () => clearTimeout(t);
  }, [search, catFilter]);

  async function handleDelete() {
    try {
      await apiRequest(`/questions/${deleteTarget.id}`, {
        method: "DELETE",
        user,
      });
      setDeleteTarget(null);
      loadQuestions();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Questions</h1>
          <p className="page-sub">The question bank players draw from.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setEditingQ({})}
          disabled={categories.length === 0}
        >
          + New question
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <p className="hint-text">
          Create a category first before adding questions.
        </p>
      )}

      <div className="q-filters">
        <input
          className="q-search"
          type="text"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="error-text" style={{ margin: "16px 0" }}>
          {error}
        </p>
      )}
      {loading && <p className="muted">Loading…</p>}

      {!loading && questions.length === 0 && (
        <p className="muted">No questions match these filters.</p>
      )}

      {!loading && questions.length > 0 && (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="cell-strong q-text">{q.question_text}</td>
                  <td className="cell-dim">{q.category_name}</td>
                  <td className="cell-actions">
                    <button className="link-btn" onClick={() => setEditingQ(q)}>
                      Edit
                    </button>
                    <button
                      className="link-btn link-btn-danger"
                      onClick={() => setDeleteTarget(q)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingQ && (
        <QuestionFormModal
          question={editingQ}
          categories={categories}
          onClose={() => setEditingQ(null)}
          onSaved={() => {
            setEditingQ(null);
            loadQuestions();
          }}
        />
      )}

      {deleteTarget && (
        <Modal title="Delete question?" onClose={() => setDeleteTarget(null)}>
          <p className="delete-warning">
            This will permanently delete this question. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn-ghost btn-block"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button className="btn btn-danger btn-block" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function QuestionFormModal({ question, categories, onClose, onSaved }) {
  const user = getUser();
  const isEditing = Boolean(question.id);
  const [categoryId, setCategoryId] = useState(
    question.category_id || categories[0]?.id || "",
  );
  const [questionText, setQuestionText] = useState(
    question.question_text || "",
  );
  const [optionA, setOptionA] = useState(question.option_a || "");
  const [optionB, setOptionB] = useState(question.option_b || "");
  const [optionC, setOptionC] = useState(question.option_c || "");
  const [optionD, setOptionD] = useState(question.option_d || "");
  const [correctOption, setCorrectOption] = useState(
    question.correct_option || "A",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const options = [
    { key: "A", value: optionA, set: setOptionA },
    { key: "B", value: optionB, set: setOptionB },
    { key: "C", value: optionC, set: setOptionC },
    { key: "D", value: optionD, set: setOptionD },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        category_id: categoryId,
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
      };
      const path = isEditing ? `/questions/${question.id}` : "/questions";
      const method = isEditing ? "PUT" : "POST";
      await apiRequest(path, { method, user, body });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? "Edit question" : "New question"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="q-text">
            Question
          </label>
          <input
            id="q-text"
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What is the capital of Japan?"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="q-cat">
            Category
          </label>
          <select
            id="q-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <label className="label">Answer options</label>
        <p className="options-hint">
          Select the radio button next to the correct answer.
        </p>

        {options.map((opt) => (
          <div key={opt.key} className="option-row">
            <input
              type="radio"
              name="correct"
              checked={correctOption === opt.key}
              onChange={() => setCorrectOption(opt.key)}
            />
            <span className="option-key">{opt.key}</span>
            <input
              type="text"
              value={opt.value}
              onChange={(e) => opt.set(e.target.value)}
              placeholder={`Option ${opt.key}`}
              required
            />
          </div>
        ))}

        {error && <p className="error-text">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={saving}
          style={{ marginTop: 12 }}
        >
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create question"}
        </button>
      </form>
    </Modal>
  );
}
