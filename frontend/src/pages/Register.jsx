import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    addressLine: "",
    city: "",
    area: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
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
      setSuccessMessage("");

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: {
          label: "Home",
          addressLine: formData.addressLine,
          city: formData.city,
          area: formData.area,
        },
      };

      const response = await api.post("/auth/register", payload);

      toast.success(
  response.data.message ||
    "Registration successful. Verification email sent."
);

      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        addressLine: "",
        city: "",
        area: "",
      });
    } catch (error) {
     toast.error(
  error.response?.data?.message || "Registration failed. Please try again."
);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>

        {message && <p className="form-message">{message}</p>}

        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
            <p>
              Please open your email and click the verification link before
              placing an order.
            </p>

            <a
              href="https://mail.google.com/"
              target="_blank"
              rel="noreferrer"
              className="auth-link"
            >
              Open Gmail
            </a>

            <br />

            <Link to="/login" className="auth-link">
              Go to Login
            </Link>
          </div>
        )}

        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter full name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Minimum 6 characters"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label>Address</label>
        <input
          type="text"
          name="addressLine"
          placeholder="Street, house number, nearby place"
          value={formData.addressLine}
          onChange={handleChange}
        />

        <label>City</label>
        <input
          type="text"
          name="city"
          placeholder="Enter city"
          value={formData.city}
          onChange={handleChange}
        />

        <label>Area</label>
        <input
          type="text"
          name="area"
          placeholder="Enter area"
          value={formData.area}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;