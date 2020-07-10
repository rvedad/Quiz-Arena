import { useNavigate } from "react-router-dom";
import { getUser } from "../../user.js";
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api.js";
import Modal from "../../components/Modal/Modal.jsx";
import "./AdminCategories.css";

export default function AdminCategories() {
  const user = getUser();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    apiRequest("/categories")
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate("/login");
      return;
    }
    load();
  }, []);

  if (!user || !user.is_admin) {
    return null;
  }

  async function handleDelete() {
    try {
      await apiRequest(`/categories/${deleteTarget.id}`, {
        method: "DELETE",
        user,
      });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">Manage the topics players can quiz on.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingCat({})}>
          + New category
        </button>
      </div>

      {error && (
        <p className="error-text" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}
      {loading && <p className="muted">Loading…</p>}

      {!loading && categories.length === 0 && (
        <p className="muted">No categories yet. Create your first one above.</p>
      )}

      {!loading && categories.length > 0 && (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="cell-strong">{cat.name}</td>
                  <td className="cell-dim">{cat.description || "—"}</td>
                  <td>{cat.question_count}</td>
                  <td className="cell-actions">
                    <button
                      className="link-btn"
                      onClick={() => setEditingCat(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="link-btn link-btn-danger"
                      onClick={() => setDeleteTarget(cat)}
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

      {editingCat && (
        <CategoryFormModal
          category={editingCat}
          onClose={() => setEditingCat(null)}
          onSaved={() => {
            setEditingCat(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <Modal title="Delete category?" onClose={() => setDeleteTarget(null)}>
          <p className="delete-warning">
            Permanently delete <strong>{deleteTarget.name}</strong> and all{" "}
            {deleteTarget.question_count} question
            {deleteTarget.question_count !== 1 ? "s" : ""} in it? This cannot be
            undone.
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

function CategoryFormModal({ category, onClose, onSaved }) {
  const user = getUser();
  const isEditing = Boolean(category.id);
  const [name, setName] = useState(category.name || "");
  const [description, setDescription] = useState(category.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const path = isEditing ? `/categories/${category.id}` : "/categories";
      const method = isEditing ? "PUT" : "POST";
      await apiRequest(path, { method, user, body: { name, description } });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? "Edit category" : "New category"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="cat-name">
            Name
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Science"
            required
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="cat-desc">
            Description (optional)
          </label>
          <input
            id="cat-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description"
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={saving}
          style={{ marginTop: 8 }}
        >
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create category"}
        </button>
      </form>
    </Modal>
  );
}
