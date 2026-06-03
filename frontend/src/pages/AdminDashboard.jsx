import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await api.get("/admin/riders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRiders(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
      fetchRiders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const acceptOrder = async (orderId) => {
    try {
      await api.put(
        `/admin/orders/${orderId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to accept order.");
    }
  };

  const rejectOrder = async (orderId) => {
    const reason = window.prompt("Enter rejection reason:");

    try {
      await api.put(
        `/admin/orders/${orderId}/reject`,
        { reason: reason || "Order rejected by admin" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject order.");
    }
  };

  const updateStatus = async (orderId, status, note) => {
    try {
      await api.put(
        `/admin/orders/${orderId}/status`,
        {
          status,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update order status.");
    }
  };

  const assignRider = async (orderId) => {
    const riderId = selectedRiders[orderId];

    if (!riderId) {
      alert("Please select a rider first.");
      return;
    }

    try {
      await api.put(
        `/admin/orders/${orderId}/assign-rider`,
        {
          riderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedRiders({
        ...selectedRiders,
        [orderId]: "",
      });

      fetchOrders();
      fetchRiders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign rider.");
    }
  };

  const availableRiders = riders.filter((rider) => rider.isAvailable);

  if (!user || user.role !== "admin") {
    return (
      <div className="checkout-message-box">
        <h1>Access Denied</h1>
        <p>Only admin can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading admin orders...</h2>;
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Admin Orders Dashboard</h1>
          <p>Manage customer orders and assign riders.</p>
        </div>

        <button
          onClick={() => {
            fetchOrders();
            fetchRiders();
          }}
        >
          Refresh
        </button>
      </div>

      <div className="admin-stats">
        <div>
          <strong>Total Orders</strong>
          <span>{orders.length}</span>
        </div>

        <div>
          <strong>Available Riders</strong>
          <span>{availableRiders.length}</span>
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
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

              <div className="order-summary-line">
                <span>Subtotal</span>
                <strong>Rs. {order.subtotal}</strong>
              </div>

              <div className="order-summary-line">
                <span>Delivery Fee</span>
                <strong>Rs. {order.deliveryFee}</strong>
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

              {order.assignedRider && (
                <p className="assigned-rider-text">
                  <strong>Assigned Rider:</strong>{" "}
                  {order.assignedRider.fullName || "Rider assigned"}
                </p>
              )}

              <div className="admin-order-actions">
                {order.orderStatus === "Pending" && (
                  <>
                    <button
                      className="accept-btn"
                      onClick={() => acceptOrder(order._id)}
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => rejectOrder(order._id)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {order.orderStatus === "Accepted" && (
                  <button
                    className="prepare-btn"
                    onClick={() =>
                      updateStatus(
                        order._id,
                        "Preparing",
                        "Kitchen started preparing the order"
                      )
                    }
                  >
                    Mark Preparing
                  </button>
                )}

                {order.orderStatus === "Preparing" && (
                  <button
                    className="ready-btn"
                    onClick={() =>
                      updateStatus(
                        order._id,
                        "Ready",
                        "Order is ready for rider assignment"
                      )
                    }
                  >
                    Mark Ready
                  </button>
                )}

                {order.orderStatus === "Ready" && (
                  <div className="rider-assign-box">
                    <select
                      value={selectedRiders[order._id] || ""}
                      onChange={(e) =>
                        setSelectedRiders({
                          ...selectedRiders,
                          [order._id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select available rider</option>

                      {availableRiders.map((rider) => (
                        <option key={rider.user._id} value={rider.user._id}>
                          {rider.user.fullName} — {rider.bikeNumberPlate}
                        </option>
                      ))}
                    </select>

                    <button
                      className="assign-btn"
                      onClick={() => assignRider(order._id)}
                    >
                      Assign Rider
                    </button>
                  </div>
                )}

                {order.orderStatus === "Assigned to Rider" && (
                  <p className="assigned-rider-text">
                    Order assigned and waiting for rider pickup.
                  </p>
                )}

                {order.orderStatus === "Delivered" && (
                  <p className="delivered-text">Order delivered successfully.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;