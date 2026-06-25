import { useEffect, useState } from "react";
import api from "../services/api";

function AdminCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/categories");

      setCategories(response.data.data || []);
    } catch (error) {
      console.error("FETCH CATEGORIES ERROR:", error);
      setMessage(
        error.response?.data?.message || "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Category name is required");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (editingId) {
        await api.put(`/categories/${editingId}`, {
          name: formData.name.trim(),
        });

        setMessage("Category updated successfully");
      } else {
        await api.post("/categories", {
          name: formData.name.trim(),
        });

        setMessage("Category added successfully");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("SAVE CATEGORY ERROR:", error);
      setMessage(
        error.response?.data?.message || "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name || "",
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      setMessage("");

      await api.delete(`/categories/${id}`);

      setMessage("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("DELETE CATEGORY ERROR:", error);
      setMessage(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  };

  return (
    <div className="category-admin-page">
      <h1>Manage Categories</h1>

      {message && <p className="form-message">{message}</p>}

      <form className="category-admin-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter category name"
          value={formData.name}
          onChange={handleChange}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId
            ? "Update Category"
            : "Add Category"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="category-table-wrapper">
          <table className="category-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button onClick={() => handleEdit(category)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(category._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminCategoryManagement;