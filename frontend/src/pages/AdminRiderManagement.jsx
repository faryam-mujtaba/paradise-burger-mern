import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminRiderManagement() {
    const { user, token } = useAuth();

    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        bikeType: "",
        bikeNumberPlate: "",
        behaviorNotes: "",
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const fetchRiders = async () => {
        try {
            setLoading(true);
            setMessage("");

            const response = await api.get("/admin/riders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRiders(response.data.data);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to fetch riders.");
        } finally {
            setLoading(false);
        }
    };
    const createRider = async (e) => {
        e.preventDefault();

        try {
            setMessage("");

            await api.post("/admin/riders", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setFormData({
                fullName: "",
                phone: "",
                email: "",
                password: "",
                bikeType: "",
                bikeNumberPlate: "",
                behaviorNotes: "",
            });

            setMessage("Rider created successfully.");
            fetchRiders();
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to create rider.");
        }
    };
    useEffect(() => {
        if (user?.role === "admin") {
            fetchRiders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const deactivateRider = async (riderId) => {
        const confirmDeactivate = window.confirm(
            "Are you sure you want to deactivate this rider?"
        );

        if (!confirmDeactivate) return;

        try {
            await api.put(
                `/admin/riders/${riderId}/deactivate`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchRiders();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to deactivate rider.");
        }
    };

    const activateRider = async (riderId) => {
        try {
            await api.put(
                `/admin/riders/${riderId}/activate`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchRiders();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to activate rider.");
        }
    };

    if (!user || user.role !== "admin") {
        return (
            <div className="checkout-message-box">
                <h1>Access Denied</h1>
                <p>Only admin can access rider management.</p>
            </div>
        );
    }

    if (loading) {
        return <h2>Loading riders...</h2>;
    }

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Admin Rider Management</h1>
                    <p>Create, activate, and deactivate riders.</p>
                </div>

                <Link to="/admin/dashboard" className="admin-link-btn">
                    Back to Dashboard
                </Link>
            </div>

            {message && <p className="form-message">{message}</p>}
<form className="admin-rider-form" onSubmit={createRider}>
  <h2>Create New Rider</h2>

  <div className="admin-rider-form-grid">
    <input
      type="text"
      name="fullName"
      placeholder="Full Name"
      value={formData.fullName}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="phone"
      placeholder="Phone"
      value={formData.phone}
      onChange={handleChange}
      required
    />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
    />

    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="bikeType"
      placeholder="Bike Type"
      value={formData.bikeType}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="bikeNumberPlate"
      placeholder="Bike Number Plate"
      value={formData.bikeNumberPlate}
      onChange={handleChange}
      required
    />
  </div>

  <textarea
    name="behaviorNotes"
    placeholder="Behavior Notes"
    value={formData.behaviorNotes}
    onChange={handleChange}
  />

  <button type="submit" className="admin-refresh-btn">
    Create Rider
  </button>
</form>
            {riders.length === 0 ? (
                <p>No riders found.</p>
            ) : (
                <div className="admin-orders-grid">
                    {riders.map((rider) => (
                        <div className="admin-order-card" key={rider._id}>
                            <div className="admin-order-top">
                                <div>
                                    <h2>{rider.user?.fullName || rider.user?.name || "Rider"}</h2>
                                    <p>{rider.phone || rider.user?.phone}</p>
                                </div>

                                <span
                                    className={
                                        rider.isActive ? "order-status delivered" : "order-status rejected"
                                    }
                                >
                                    {rider.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="admin-customer-box">
                                <p>
                                    <strong>Bike Type:</strong> {rider.bikeType}
                                </p>

                                <p>
                                    <strong>Bike Number Plate:</strong> {rider.bikeNumberPlate}
                                </p>

                                <p>
                                    <strong>Available:</strong> {rider.isAvailable ? "Yes" : "No"}
                                </p>

                                <p>
                                    <strong>Completed Deliveries:</strong>{" "}
                                    {rider.totalCompletedDeliveries}
                                </p>

                                <p>
                                    <strong>Failed Deliveries:</strong> {rider.totalFailedDeliveries}
                                </p>
                            </div>

                            <div className="admin-order-actions">
                                {rider.isActive ? (
                                    <button
                                        className="reject-btn"
                                        onClick={() => deactivateRider(rider._id)}
                                    >
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        className="accept-btn"
                                        onClick={() => activateRider(rider._id)}
                                    >
                                        Activate
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminRiderManagement;