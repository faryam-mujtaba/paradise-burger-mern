import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import PageTransition from "../components/animations/PageTransition";

const VerifyEmail = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);

        setSuccess(true);
        setMessage(res.data.message || "Email verified successfully");
      } catch (error) {
        setSuccess(false);
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmailToken();
    }
  }, [token]);

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-card">
          <h2>Email Verification</h2>

          {loading ? (
            <p>Verifying your email...</p>
          ) : (
            <>
              <p
                style={{
                  color: success ? "green" : "red",
                  fontWeight: "600",
                  marginTop: "12px",
                }}
              >
                {message}
              </p>

              {success ? (
                <Link to="/login" className="auth-btn">
                  Go to Login
                </Link>
              ) : (
                <Link to="/register" className="auth-btn">
                  Register Again
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyEmail;