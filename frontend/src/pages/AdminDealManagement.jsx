import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/deals.css";

const backendHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "localhost"
    : window.location.hostname;

const backendRoot = `http://${backendHost}:5000`;

function AdminDealManagement() {
  const fileInputRef = useRef(null);

  const [deals, setDeals] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    itemsIncluded: "",
    originalPrice: "",
    dealPrice: "",
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${backendRoot}${image}`;
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/deals");
      setDeals(response.data.data || []);
    } catch (error) {
      console.error("FETCH DEALS ERROR:", error);
      setMessage(error.response?.data?.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      itemsIncluded: "",
      originalPrice: "",
      dealPrice: "",
      isActive: true,
    });

    setImageFile(null);
    setImagePreview("");
    setCurrentImage("");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.itemsIncluded.trim() ||
      !formData.originalPrice ||
      !formData.dealPrice
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("itemsIncluded", formData.itemsIncluded.trim());
      data.append("originalPrice", formData.originalPrice);
      data.append("dealPrice", formData.dealPrice);
      data.append("isActive", formData.isActive);

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingId) {
        await api.put(`/deals/${editingId}`, data);
        setMessage("Deal updated successfully");
      } else {
        await api.post("/deals", data);
        setMessage("Deal added successfully");
      }

      resetForm();
      fetchDeals();
    } catch (error) {
      console.error("SAVE DEAL ERROR:", error);
      setMessage(error.response?.data?.message || "Failed to save deal");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (deal) => {
    setEditingId(deal._id);

    setFormData({
      title: deal.title || "",
      description: deal.description || "",
      itemsIncluded: deal.itemsIncluded || "",
      originalPrice: deal.originalPrice || "",
      dealPrice: deal.dealPrice || "",
      isActive: deal.isActive,
    });

    setImageFile(null);
    setImagePreview("");
    setCurrentImage(deal.image || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (id) => {
    setPendingDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      setMessage("");
      await api.delete(`/deals/${pendingDeleteId}`);
      setMessage("Deal deleted successfully");
      setIsDeleteModalOpen(false);
      setPendingDeleteId(null);
      fetchDeals();
    } catch (error) {
      console.error("DELETE DEAL ERROR:", error);
      setMessage(error.response?.data?.message || "Failed to delete deal");
    }
  };

  return (
    <div className="deal-admin-page">
      <div className="deal-admin-header">
        <div>
          <p className="deal-kicker">Admin Panel</p>
          <h1>Hot Deals Management</h1>
          <p>Add special offers that customers will see at the top of the site.</p>
        </div>
      </div>

      {message && <p className="deal-message">{message}</p>}

      <form className="deal-form" onSubmit={handleSubmit}>
        <div className="deal-form-grid">
          <div>
            <label>Deal Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Example: Zinger Combo Deal"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Deal Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label>Original Price *</label>
            <input
              type="number"
              name="originalPrice"
              placeholder="Example: 1500"
              value={formData.originalPrice}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Deal Price *</label>
            <input
              type="number"
              name="dealPrice"
              placeholder="Example: 1199"
              value={formData.dealPrice}
              onChange={handleChange}
            />
          </div>

          <div className="deal-form-full">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Short attractive description for this deal"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="deal-form-full">
            <label>Items Included *</label>
            <textarea
              name="itemsIncluded"
              placeholder="Example: 2 Zinger Burgers, 1 Fries, 2 Cold Drinks"
              value={formData.itemsIncluded}
              onChange={handleChange}
            />
          </div>

          {(imagePreview || currentImage) && (
            <div className="deal-form-full">
              <label>Image Preview</label>
              <div className="deal-image-preview">
                <img
                  src={imagePreview || getImageUrl(currentImage)}
                  alt="Deal Preview"
                />
              </div>
            </div>
          )}

          <label className="deal-active-check">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Show this deal to customers
          </label>
        </div>

        <div className="deal-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Deal" : "Add Deal"}
          </button>

          {editingId && (
            <button type="button" className="deal-cancel-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading deals...</p>
      ) : deals.length === 0 ? (
        <div className="empty-deals-box">
          <h2>No deals found</h2>
          <p>Add your first hot deal using the form above.</p>
        </div>
      ) : (
        <div className="deal-admin-grid">
          {deals.map((deal) => (
            <div className="deal-admin-card" key={deal._id}>
              <div className="deal-admin-image">
                {deal.image ? (
                  <img src={getImageUrl(deal.image)} alt={deal.title} />
                ) : (
                  <span>🍔</span>
                )}
              </div>

              <div className="deal-admin-info">
                <div className="deal-card-top">
                  <h2>{deal.title}</h2>
                  <span className={deal.isActive ? "deal-active" : "deal-inactive"}>
                    {deal.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                <p>{deal.description}</p>

                <p>
                  <strong>Items:</strong> {deal.itemsIncluded}
                </p>

                <div className="deal-price-row">
                  <span className="old-price">Rs {deal.originalPrice}</span>
                  <span className="new-price">Rs {deal.dealPrice}</span>
                </div>

                <div className="deal-card-actions">
                  <button onClick={() => handleEdit(deal)}>Edit</button>
                  <button onClick={() => openDeleteModal(deal._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete deal?"
        message="This will remove the hot deal from the site. Customers will no longer see it."
        confirmText="Delete Deal"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}

export default AdminDealManagement;