import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/auth/login", formData);

      const user = response.data.data.user;
      const token = response.data.data.token;

      login(user, token);

      setMessage("Login successful");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "rider") {
        navigate("/rider/dashboard");
      } else {
        navigate("/menu");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        {message && <p className="form-message">{message}</p>}

        <label>Phone Number or Email</label>
        <input
          type="text"
          name="identifier"
          placeholder="Enter phone number or email"
          value={formData.identifier}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <p style={{ marginTop: "8px", textAlign: "right" }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p style={{ marginTop: "10px" }}>
          Did not receive verification email?{" "}
          <Link to="/resend-verification">Resend Email</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;