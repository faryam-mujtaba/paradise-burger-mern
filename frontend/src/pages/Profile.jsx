import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaSignOutAlt,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import PageTransition from "../components/animations/PageTransition";

import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();

  const { user, token, logout } = useAuth();
  const { showNotification } = useNotification();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine: "",
    city: "",
    area: "",
  });

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getDefaultAddress = (profileData) => {
    if (!profileData?.addresses?.length) {
      return null;
    }

    return (
      profileData.addresses.find((address) => address.isDefault) ||
      profileData.addresses[0]
    );
  };

  const fillProfileForm = (profileData) => {
    const defaultAddress = getDefaultAddress(profileData);

    setFormData({
      fullName: profileData?.fullName || "",
      phone: profileData?.phone || "",
      email: profileData?.email || "",
      addressLine: defaultAddress?.addressLine || "",
      city: defaultAddress?.city || "",
      area: defaultAddress?.area || "",
    });
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/profile/me", authConfig);
      const profileData = response.data.data;

      setProfile(profileData);
      fillProfileForm(profileData);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load your profile.";

      setMessage(errorMessage);

      showNotification("Profile error", "error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.fullName.trim().length < 2) {
      return "Full name must contain at least 2 characters.";
    }

    if (formData.phone.trim().length < 7) {
      return "Please enter a valid phone number.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      return "Please enter a valid email address.";
    }

    if (profile?.role === "customer") {
      const hasAnyAddress =
        formData.addressLine.trim() ||
        formData.city.trim() ||
        formData.area.trim();

      if (hasAnyAddress) {
        if (formData.addressLine.trim().length < 8) {
          return "Address must contain at least 8 characters.";
        }

        if (formData.city.trim().length < 2) {
          return "Please enter a valid city.";
        }

        if (formData.area.trim().length < 2) {
          return "Please enter a valid area.";
        }
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);

      showNotification(
        "Check profile details",
        "error",
        validationError
      );

      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      if (profile?.role === "customer") {
        payload.addressLine = formData.addressLine.trim();
        payload.city = formData.city.trim();
        payload.area = formData.area.trim();
      }

      const response = await api.put(
        "/profile/me",
        payload,
        authConfig
      );

      const updatedProfile = response.data.data;

      setProfile(updatedProfile);
      fillProfileForm(updatedProfile);

      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: updatedProfile,
        })
      );

      setMessage(response.data.message || "Profile updated successfully.");

      showNotification(
        "Profile updated",
        "success",
        response.data.message || "Your profile has been updated."
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update your profile.";

      setMessage(errorMessage);

      showNotification("Update failed", "error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = useMemo(() => {
    const name = profile?.fullName || user?.fullName || "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile, user]);

  const roleLabel =
    profile?.role === "admin"
      ? "Administrator"
      : profile?.role === "subadmin"
        ? "Sub Administrator"
        : "Customer";

  if (loading) {
    return (
      <PageTransition>
        <div className="profile-loading">
          <h2>Loading your profile...</h2>
        </div>
      </PageTransition>
    );
  }

  if (!profile) {
    return (
      <PageTransition>
        <div className="checkout-message-box">
          <h1>Profile Unavailable</h1>
          <p>{message || "Your profile could not be loaded."}</p>

          <button type="button" onClick={fetchProfile}>
            Try Again
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="profile-page">
        <div className="profile-header-card">
          <div className="profile-avatar">{initials || "U"}</div>

          <div className="profile-header-details">
            <span className="profile-kicker">Paradise Burger Account</span>

            <h1>{profile.fullName}</h1>

            <div className="profile-role">
              <FaUserShield />
              <span>{roleLabel}</span>
            </div>

            <p>
              Manage your account information and keep your contact details
              updated.
            </p>
          </div>

          <div className="profile-header-actions">
            <button
              type="button"
              className="profile-password-btn"
              onClick={() => navigate("/change-password")}
            >
              <FaLock />
              Change Password
            </button>

            <button
              type="button"
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        <div className="profile-content-grid">
          <div className="profile-information-card">
            <h2>Account Information</h2>

            <div className="profile-info-row">
              <FaUser />

              <div>
                <span>Full Name</span>
                <strong>{profile.fullName || "Not provided"}</strong>
              </div>
            </div>

            <div className="profile-info-row">
              <FaPhone />

              <div>
                <span>Phone Number</span>
                <strong>{profile.phone || "Not provided"}</strong>
              </div>
            </div>

            <div className="profile-info-row">
              <FaEnvelope />

              <div>
                <span>Email Address</span>
                <strong>{profile.email || "Not provided"}</strong>
              </div>
            </div>

            <div className="profile-verification-row">
              <span>Email Status</span>

              <strong
                className={
                  profile.isEmailVerified
                    ? "profile-verified"
                    : "profile-not-verified"
                }
              >
                {profile.isEmailVerified ? "Verified" : "Not Verified"}
              </strong>
            </div>

            <div className="profile-verification-row">
              <span>Account Role</span>
              <strong>{roleLabel}</strong>
            </div>
          </div>

          <form className="profile-edit-card" onSubmit={handleSubmit}>
            <div className="profile-edit-heading">
              <div>
                <span>Edit Profile</span>
                <h2>Update Your Details</h2>
              </div>

              <FaUser />
            </div>

            {message && <p className="form-message">{message}</p>}

            <div className="profile-form-grid">
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  maxLength={80}
                />
              </label>

              <label>
                Phone Number
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  maxLength={25}
                />
              </label>

              <label className="profile-full-field">
                Email Address
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  maxLength={120}
                />
              </label>
            </div>

            {profile.role === "customer" && (
              <>
                <div className="profile-address-heading">
                  <FaMapMarkerAlt />
                  <h3>Default Delivery Address</h3>
                </div>

                <div className="profile-form-grid">
                  <label className="profile-full-field">
                    Address
                    <input
                      type="text"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleChange}
                      placeholder="Street, house number and nearby place"
                      maxLength={120}
                    />
                  </label>

                  <label>
                    City
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      maxLength={40}
                    />
                  </label>

                  <label>
                    Area
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Enter area"
                      maxLength={60}
                    />
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              className="profile-save-btn"
              disabled={saving}
            >
              <FaSave />
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default Profile;