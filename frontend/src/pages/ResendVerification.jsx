import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageTransition from "../components/animations/PageTransition";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSuccessMessage("");

      const response = await api.post("/auth/resend-verification-email", {
        email,
      });

      setSuccessMessage(
        response.data.message ||
          "Verification email sent again. Please check your inbox."
      );

      setEmail("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to resend verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="form-page">
        <form className="auth-form" onSubmit={handleResend}>
          <h1>Resend Verification Email</h1>

          {message && <p className="form-message">{message}</p>}

          {successMessage && (
            <div className="success-message">
              <p>{successMessage}</p>
              <p>Please open your email and click the verification link.</p>

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
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>

          <p style={{ marginTop: "12px" }}>
            Already verified? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </PageTransition>
  );
};

export default ResendVerification;