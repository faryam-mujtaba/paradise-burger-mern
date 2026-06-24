import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/animations/PageTransition";

function RiderDashboard() {
  const { user, token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const profileResponse = await api.get("/rider/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ordersResponse = await api.get("/rider/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(profileResponse.data.data);
      setOrders(ordersResponse.data.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load rider dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchRiderData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateAvailability = async (isAvailable) => {
    try {
      await api.put(
        "/rider/availability",
        { isAvailable },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRiderData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update availability.");
    }
  };

  const updateOrder = async (orderId, action) => {
    try {
      await api.put(
        `/rider/orders/${orderId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRiderData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update order.");
    }
  };

  const markFailed = async (orderId) => {
    const reason = window.prompt("Enter failed delivery reason:");

    try {
      await api.put(
        `/rider/orders/${orderId}/failed`,
        {
          reason: reason || "Delivery failed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRiderData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark as failed.");
    }
  };

  if (!user || user.role !== "rider") {
    return (
      <div className="checkout-message-box">
        <h1>Access Denied</h1>
        <p>Only riders can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading rider dashboard...</h2>;
  }

  return (
    <PageTransition>
    <div>
      <div className="admin-header">
        <div>
          <h1>Rider Dashboard</h1>
          <p>Manage delivery orders and availability.</p>
        </div>

        <button onClick={fetchRiderData}>Refresh</button>
      </div>

      {message && <p className="form-message">{message}</p>}

      {profile && (
        <div className="rider-profile-card">
          <div>
            <h2>{profile.user.fullName}</h2>
            <p>
              <strong>Phone:</strong> {profile.phone}
            </p>
            <p>
              <strong>Bike:</strong> {profile.bikeType}
            </p>
            <p>
              <strong>Plate:</strong> {profile.bikeNumberPlate}
            </p>
          </div>

          <div className="rider-profile-right">
            <span
              className={
                profile.isAvailable
                  ? "availability-badge available"
                  : "availability-badge not-available"
              }
            >
              {profile.isAvailable ? "Available" : "Not Available"}
            </span>

            <div className="availability-actions">
              <button onClick={() => updateAvailability(true)}>
                Set Available
              </button>
              <button onClick={() => updateAvailability(false)}>
                Set Not Available
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-stats">
        <div>
          <strong>Assigned Orders</strong>
          <span>{orders.length}</span>
        </div>

        <div>
          <strong>Completed</strong>
          <span>{profile?.totalCompletedDeliveries || 0}</span>
        </div>

        <div>
          <strong>Failed</strong>
          <span>{profile?.totalFailedDeliveries || 0}</span>
        </div>
      </div>

      <h2>Assigned Orders</h2>

      {orders.length === 0 ? (
        <p>No assigned orders yet.</p>
      ) : (
        <div className="admin-orders-grid">
          {orders.map((order) => (
            <div className="admin-order-card" key={order._id}>
              <div className="admin-order-top">
                <div>
                  <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <span
                  className={`order-status ${order.orderStatus
                    .replaceAll(" ", "-")
                    .toLowerCase()}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="admin-customer-box">
                <p>
                  <strong>Customer:</strong> {order.customerSnapshot.fullName}
                </p>
                <p>
                  <strong>Phone:</strong> {order.customerSnapshot.phone}
                </p>
                <p>
                  <strong>Address:</strong> {order.deliveryAddress.addressLine},{" "}
                  {order.deliveryAddress.area}, {order.deliveryAddress.city}
                </p>
              </div>

              <div className="admin-order-items">
                {order.items.map((item, index) => (
                  <div className="order-item-row" key={index}>
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <strong>Rs. {item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              <div className="order-total-line">
                <span>Total</span>
                <strong>Rs. {order.totalAmount}</strong>
              </div>

              {order.specialInstructions && (
                <p className="admin-instructions">
                  <strong>Instructions:</strong> {order.specialInstructions}
                </p>
              )}

              <div className="admin-order-actions">
                {order.orderStatus === "Assigned to Rider" && (
                  <button
                    className="prepare-btn"
                    onClick={() => updateOrder(order._id, "pickup")}
                  >
                    Mark Picked Up
                  </button>
                )}

                {order.orderStatus === "Picked Up" && (
                  <button
                    className="ready-btn"
                    onClick={() => updateOrder(order._id, "out-for-delivery")}
                  >
                    Out for Delivery
                  </button>
                )}

                {(order.orderStatus === "Picked Up" ||
                  order.orderStatus === "Out for Delivery") && (
                  <button
                    className="accept-btn"
                    onClick={() => updateOrder(order._id, "delivered")}
                  >
                    Mark Delivered
                  </button>
                )}

                {order.orderStatus !== "Delivered" &&
                  order.orderStatus !== "Failed Delivery" && (
                    <button
                      className="reject-btn"
                      onClick={() => markFailed(order._id)}
                    >
                      Mark Failed
                    </button>
                  )}

                {order.orderStatus === "Delivered" && (
                  <p className="delivered-text">
                    This order has been delivered.
                  </p>
                )}

                {order.orderStatus === "Failed Delivery" && (
                  <p className="assigned-rider-text">
                    This order was marked as failed delivery.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
}

export default RiderDashboard;