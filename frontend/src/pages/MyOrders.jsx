import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import PageTransition from "../components/animations/PageTransition";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/myOrders.css";

function MyOrders() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchMyOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setMessage("");

      const response = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch your orders.";

      setMessage(errorMessage);

      if (!silent) {
        showNotification("Error", "error", errorMessage);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const openRemoveModal = (orderId) => {
    setSelectedOrderId(orderId);
    setRemoveModalOpen(true);
  };

  const closeRemoveModal = () => {
    setSelectedOrderId(null);
    setRemoveModalOpen(false);
  };

  const confirmRemoveOrder = async () => {
    if (!selectedOrderId) return;

    try {
      await api.put(`/orders/${selectedOrderId}/hide`, {});

      showNotification(
        "Order removed",
        "success",
        "This order was removed from your list"
      );

      closeRemoveModal();
      fetchMyOrders(true);
      window.dispatchEvent(new Event("ordersChanged"));
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to remove order"
      );
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchMyOrders(false);

    const handleOrdersChanged = () => {
      fetchMyOrders(true);
    };

    window.addEventListener("ordersChanged", handleOrdersChanged);

    return () => {
      window.removeEventListener("ordersChanged", handleOrdersChanged);
    };
  }, [token]);

  if (!user) {
    return (
      <div className="checkout-message-box">
        <h1>Login Required</h1>
        <p>Please login to view your orders.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  if (user.role !== "customer") {
    return (
      <div className="checkout-message-box">
        <h1>Access Denied</h1>
        <p>Only customers can view customer orders.</p>
        <button onClick={() => navigate("/menu")}>Back to Menu</button>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading your orders...</h2>;
  }

  return (
    <PageTransition>
      <div className="my-orders-page">
        <h1>My Orders</h1>

        {message && <p className="form-message">{message}</p>}

        {orders.length === 0 ? (
          <div className="empty-my-orders">
            <h2>No orders found</h2>
            <p>You have not placed any active orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-card-header">
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

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div className="order-item-row" key={index}>
                      <span>
                        {item.name} x {item.quantity}
                        {item.itemType === "deal" && (
                          <small className="checkout-deal-label">
                            {" "}
                            Hot Deal
                          </small>
                        )}
                      </span>

                      <strong>Rs. {item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-summary-line">
                  <span>Subtotal</span>
                  <strong>Rs. {order.subtotal}</strong>
                </div>

                <div className="order-total-line">
                  <span>Total</span>
                  <strong>Rs. {order.totalAmount}</strong>
                </div>

                <p>
                  <strong>Delivery Address:</strong>{" "}
                  {order.deliveryAddress?.addressLine},{" "}
                  {order.deliveryAddress?.area},{" "}
                  {order.deliveryAddress?.city}
                </p>

                {order.specialInstructions && (
                  <p>
                    <strong>Instructions:</strong> {order.specialInstructions}
                  </p>
                )}

                <div className="status-history">
                  <h3>Status History</h3>

                  {(order.statusHistory || []).map((history, index) => (
                    <p key={index}>
                      <strong>{history.status}</strong> — {history.note}
                    </p>
                  ))}
                </div>

                {["Delivered", "Rejected", "Cancelled"].includes(
                  order.orderStatus
                ) && (
                  <div className="customer-order-actions">
                    <button
                      className="remove-order-btn"
                      onClick={() => openRemoveModal(order._id)}
                    >
                      Remove from My Orders
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          isOpen={removeModalOpen}
          title="Remove Order?"
          message="This order will only be removed from your My Orders page. Admin records will stay safe."
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={confirmRemoveOrder}
          onCancel={closeRemoveModal}
        />
      </div>
    </PageTransition>
  );
}

export default MyOrders;