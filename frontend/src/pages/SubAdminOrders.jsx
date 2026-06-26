import { useEffect, useState } from "react";
import api from "../services/api";
import PageTransition from "../components/animations/PageTransition";
import MotionButton from "../components/animations/MotionButton";
import { useNotification } from "../context/NotificationContext";
function SubAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const { showNotification } = useNotification();
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const url = statusFilter
        ? `/admin/orders?status=${statusFilter}`
        : "/admin/orders";

      const response = await api.get(url);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("FETCH SUB ADMIN ORDERS ERROR:", error);
      setMessage(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const acceptOrder = async (orderId) => {
    try {
      setMessage("");
      await api.put(`/admin/orders/${orderId}/accept`);
      showNotification("Order accepted successfully", "success");
      fetchOrders();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update order", "error");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setMessage("");
      await api.put(`/admin/orders/${orderId}/status`, {
        status,
        note: `Order marked as ${status} by sub admin`,
      });
      showNotification(`Order marked as ${status}`, "success");
      fetchOrders();
    } catch (error) {
      showNotification(
      error.response?.data?.message || "Failed to update order",
      "error"
    );
    }
  };

  const getStatusClass = (status) => {
    return `order-status ${status?.toLowerCase()}`;
  };

  return (
    <PageTransition>
      <div className="subadmin-page">
        <div className="subadmin-header">
          <div>
            <p className="subadmin-kicker">Order Manager</p>
            <h1>Sub Admin Orders Panel</h1>
            <p>Accept orders and update delivery status.</p>
          </div>

          <MotionButton className="admin-refresh-btn" onClick={fetchOrders}>
            Refresh
          </MotionButton>
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="subadmin-filters">
          <button
            className={statusFilter === "" ? "active-filter" : ""}
            onClick={() => setStatusFilter("")}
          >
            All
          </button>

          <button
            className={statusFilter === "Pending" ? "active-filter" : ""}
            onClick={() => setStatusFilter("Pending")}
          >
            Pending
          </button>

          <button
            className={statusFilter === "Accepted" ? "active-filter" : ""}
            onClick={() => setStatusFilter("Accepted")}
          >
            Accepted
          </button>

          <button
            className={statusFilter === "Preparing" ? "active-filter" : ""}
            onClick={() => setStatusFilter("Preparing")}
          >
            Preparing
          </button>

          <button
            className={statusFilter === "Ready" ? "active-filter" : ""}
            onClick={() => setStatusFilter("Ready")}
          >
            Ready
          </button>

          <button
            className={statusFilter === "Delivered" ? "active-filter" : ""}
            onClick={() => setStatusFilter("Delivered")}
          >
            Delivered
          </button>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-deals-box">
            <h2>No orders found</h2>
            <p>No orders available for this status.</p>
          </div>
        ) : (
          <div className="subadmin-orders-grid">
            {orders.map((order) => (
              <div className="subadmin-order-card" key={order._id}>
                <div className="subadmin-order-top">
                  <div>
                    <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
                    <p>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span className={getStatusClass(order.orderStatus)}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="subadmin-customer-box">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.customerSnapshot?.fullName ||
                      order.customer?.fullName ||
                      "Customer"}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {order.customerSnapshot?.phone ||
                      order.customer?.phone ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {order.deliveryAddress?.addressLine},{" "}
                    {order.deliveryAddress?.area},{" "}
                    {order.deliveryAddress?.city}
                  </p>
                </div>

                <div className="subadmin-items">
                  <h3>Items</h3>

                  {order.items.map((item, index) => (
                    <div className="subadmin-item-row" key={index}>
                      <span>
                        {item.name} x {item.quantity}
                        {item.itemType === "deal" && (
                          <small className="checkout-deal-label"> Hot Deal</small>
                        )}
                      </span>

                      <strong>Rs. {item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <p className="subadmin-note">
                    <strong>Instructions:</strong> {order.specialInstructions}
                  </p>
                )}

                <div className="subadmin-total">
                  <strong>Total:</strong>
                  <span>Rs. {order.totalAmount}</span>
                </div>

                <div className="subadmin-actions">
                  {order.orderStatus === "Pending" && (
                    <MotionButton
                      className="accept-btn"
                      onClick={() => acceptOrder(order._id)}
                    >
                      Accept Order
                    </MotionButton>
                  )}

                  {order.orderStatus === "Accepted" && (
                    <MotionButton
                      className="prepare-btn"
                      onClick={() => updateOrderStatus(order._id, "Preparing")}
                    >
                      Mark Preparing
                    </MotionButton>
                  )}

                  {order.orderStatus === "Preparing" && (
                    <MotionButton
                      className="ready-btn"
                      onClick={() => updateOrderStatus(order._id, "Ready")}
                    >
                      Mark Ready
                    </MotionButton>
                  )}

                  {order.orderStatus === "Ready" && (
                    <MotionButton
                      className="accept-btn"
                      onClick={() => updateOrderStatus(order._id, "Delivered")}
                    >
                      Mark Delivered
                    </MotionButton>
                  )}

                  {["Delivered", "Rejected", "Cancelled"].includes(
                    order.orderStatus
                  ) && (
                    <p className="delivered-text">
                      Final Status: {order.orderStatus}
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

export default SubAdminOrders;