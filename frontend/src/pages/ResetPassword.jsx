import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import PageTransition from "../components/animations/PageTransition";

const ResetPassword = () => {
  const { token } = useParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSuccessMessage("");

      const response = await api.put(`/auth/reset-password/${token}`, {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage(
        response.data.message ||
          "Password reset successfully. You can login now."
      );

      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="form-page">
        <form className="auth-form" onSubmit={handleResetPassword}>
          <h1>Reset Password</h1>

          {message && <p className="form-message">{message}</p>}

          {successMessage && (
            <div className="success-message">
              <p>{successMessage}</p>
              <Link to="/login" className="auth-link">
                Go to Login
              </Link>
            </div>
          )}

          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Example: NewTest@123"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;