import { useState } from "react";
import PageTransition from "../components/animations/PageTransition";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ChangePassword() {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await api.put(
        "/auth/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Password changed successfully.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="form-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Change Password</h1>

          {message && <p className="form-message">{message}</p>}

          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            placeholder="Enter current password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Example: Burger@123"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />

          <small>
            Password must have at least 6 characters, one uppercase letter, and
            one special character.
          </small>

          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}

export default ChangePassword;