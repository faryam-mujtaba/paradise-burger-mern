import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageTransition from "../components/animations/PageTransition";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
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
        email,
      });

      setSuccessMessage(
        response.data.message ||
          "Password reset link sent. Please check your email."
      );

      setEmail("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to send password reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="form-page">
        <form className="auth-form" onSubmit={handleForgotPassword}>
          <h1>Forgot Password</h1>

          {message && <p className="form-message">{message}</p>}

          {successMessage && (
            <div className="success-message">
              <p>{successMessage}</p>
              <p>
                Open your email and click the reset password link within 15
                minutes.
              </p>

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

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p style={{ marginTop: "12px" }}>
            Remember password? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;