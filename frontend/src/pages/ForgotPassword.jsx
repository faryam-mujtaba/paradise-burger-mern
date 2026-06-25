import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSuccessMessage("");

      const response = await api.post("/auth/forgot-password", {
        identifier,
      });

      setSuccessMessage(
        response.data.message ||
          "Password reset link sent. Please check your email."
      );

      setIdentifier("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Forgot password backend is not ready yet."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="auth-form" onSubmit={handleForgotPassword}>
        <h1>Forgot Password</h1>

        {message && <p className="form-message">{message}</p>}

        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>

            <a
              href="https://mail.google.com/"
              target="_blank"
              rel="noreferrer"
              className="auth-link"
            >
              Open Gmail
            </a>
          </div>
        )}

        <label>Email or Phone Number</label>
        <input
          type="text"
          placeholder="Enter your email or phone number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p style={{ marginTop: "10px" }}>
          Remember password? <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;