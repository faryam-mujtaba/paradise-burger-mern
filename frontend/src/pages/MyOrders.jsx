import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to fetch your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

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
    <div>
      <h1>My Orders</h1>

      {message && <p className="form-message">{message}</p>}

      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <span className={`order-status ${order.orderStatus.replaceAll(" ", "-").toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-items">
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

              <p>
                <strong>Delivery Address:</strong>{" "}
                {order.deliveryAddress.addressLine}, {order.deliveryAddress.area},{" "}
                {order.deliveryAddress.city}
              </p>

              {order.specialInstructions && (
                <p>
                  <strong>Instructions:</strong> {order.specialInstructions}
                </p>
              )}

              <div className="status-history">
                <h3>Status History</h3>
                {order.statusHistory.map((history, index) => (
                  <p key={index}>
                    <strong>{history.status}</strong> — {history.note}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;