import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
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

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
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
          <p>Manage customer orders for Paradise Burger.</p>
        </div>

        <button onClick={fetchOrders}>Refresh Orders</button>
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
                  <button className="assign-btn">
                    Ready for Rider Assignment
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

export default AdminDashboard;