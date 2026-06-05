import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminCategoryManagement() {
  const { user, token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/categories");

      setCategories(response.data.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessage("Category updated successfully.");
      } else {
        await api.post("/categories", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessage("Category created successfully.");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save category.");
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
  };

  const deleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Category deleted successfully.");
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete category.");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="checkout-message-box">
        <h1>Access Denied</h1>
        <p>Only admin can access category management.</p>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading categories...</h2>;
  }

  return (
    <div>
 <div className="admin-header">
  <div>
    <h1>Admin Category Management</h1>
    <p>Create, update, and delete menu categories.</p>
  </div>

  <div className="admin-header-actions">
    <Link to="/admin/menu" className="admin-link-btn">
      Manage Menu
    </Link>

    <Link to="/admin/dashboard" className="admin-link-btn">
      Back to Dashboard
    </Link>
  </div>
</div>

      {message && <p className="form-message">{message}</p>}

      <form className="admin-rider-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Update Category" : "Create New Category"}</h2>

        <div className="admin-rider-form-grid">
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="description"
            placeholder="Category Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="admin-header-actions" style={{ marginTop: "14px" }}>
          <button type="submit" className="admin-refresh-btn">
            {editingId ? "Update Category" : "Create Category"}
          </button>

          {editingId && (
            <button
              type="button"
              className="admin-link-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="admin-orders-grid">
          {categories.map((category) => (
            <div className="admin-order-card" key={category._id}>
              <div className="admin-order-top">
                <div>
                  <h2>{category.name}</h2>
                  <p>{category.description || "No description"}</p>
                </div>

                <span className="order-status delivered">Category</span>
              </div>

              <div className="admin-order-actions">
                <button
                  className="prepare-btn"
                  onClick={() => startEdit(category)}
                >
                  Edit
                </button>

                <button
                  className="reject-btn"
                  onClick={() => deleteCategory(category._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCategoryManagement;