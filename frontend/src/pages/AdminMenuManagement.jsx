import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/animations/PageTransition";
function AdminMenuManagement() {
  const { user, token } = useAuth();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
    isAvailable: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const menuResponse = await api.get("/menu");
      const categoryResponse = await api.get("/categories");

      setMenuItems(menuResponse.data.data);
      setCategories(categoryResponse.data.data);
    } catch (error) {
      setMessage("Failed to load menu management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: null,
      isAvailable: true,
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      setMessage("Name, price, and category are required.");
      return;
    }

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("isAvailable", formData.isAvailable);

      if (formData.image) {
        data.append("image", formData.image);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingId) {
        await api.put(`/menu/${editingId}`, data, config);
        setMessage("Menu item updated successfully.");
      } else {
        await api.post("/menu", data, config);
        setMessage("Menu item added successfully.");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save menu item.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category?._id || item.category || "",
      image: null,
      isAvailable: item.isAvailable ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this menu item?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/menu/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Menu item removed successfully.");
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove item.");
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="checkout-message-box">
        <h1>Access Denied</h1>
        <p>Only admin can access menu management.</p>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading menu management...</h2>;
  }

  return (
    <PageTransition>
    <div>
     <div className="admin-header">
  <div>
    <h1>Admin Menu Management</h1>
    <p>Add, update, and remove Paradise Burger menu items.</p>
  </div>

  <div className="admin-header-actions">
    <Link to="/admin/dashboard" className="admin-link-btn">
      Back to Dashboard
    </Link>

    <button className="admin-refresh-btn" onClick={fetchData}>
      Refresh
    </button>
  </div>
</div>

      {message && <p className="form-message">{message}</p>}

      <form className="menu-management-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Update Menu Item" : "Add New Menu Item"}</h2>

        <div className="form-grid">
          <div>
            <label>Item Name</label>
            <input
              type="text"
              name="name"
              placeholder="Example: Zinger Burger"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              name="price"
              placeholder="Example: 450"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Item Picture</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </div>

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Short item description"
          value={formData.description}
          onChange={handleChange}
        />

        <label className="available-checkbox">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
          />
          Item Available
        </label>

        <div className="menu-form-actions">
          <button type="submit">
            {editingId ? "Update Item" : "Add Item"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-edit-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2>Current Menu Items</h2>

      {menuItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <div className="menu-management-grid">
          {menuItems.map((item) => (
            <div className="menu-management-card" key={item._id}>
              <div className="menu-management-image">
                {item.imageUrl ? (
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                ) : (
                  <span>🍔</span>
                )}
              </div>

              <div className="menu-management-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <p>
                  <strong>Category:</strong>{" "}
                  {item.category?.name || "No category"}
                </p>

                <p>
                  <strong>Price:</strong> Rs. {item.price}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {item.isAvailable ? "Available" : "Not Available"}
                </p>

                <div className="menu-management-actions">
                  <button onClick={() => startEdit(item)}>Edit</button>

                  <button
                    className="delete-menu-btn"
                    onClick={() => deleteItem(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
}

export default AdminMenuManagement;