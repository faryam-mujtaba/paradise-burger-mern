import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import PromptModal from "../components/PromptModal";
import PageTransition from "../components/animations/PageTransition";
import "../styles/admin.css";
function AdminDashboard() {
  const { user, token } = useAuth();
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const [showAllOrders, setShowAllOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setMessage("");

      const response = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch orders.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders(false);

    const handleOrdersChanged = () => {
      fetchOrders(true);
    };

    window.addEventListener("ordersChanged", handleOrdersChanged);

    return () => {
      window.removeEventListener("ordersChanged", handleOrdersChanged);
    };
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders]);

  const normalizedSearch = orderSearch
    .trim()
    .toLowerCase()
    .replace("order", "")
    .replace("#", "")
    .replace(/\s/g, "");

  const searchedOrders = useMemo(() => {
    if (!normalizedSearch) return [];

    return sortedOrders.filter((order) => {
      const fullId = order._id?.toLowerCase() || "";
      const shortId = order._id?.slice(-6).toLowerCase() || "";

      return fullId.includes(normalizedSearch) || shortId.includes(normalizedSearch);
    });
  }, [normalizedSearch, sortedOrders]);

  const visibleOrders = normalizedSearch
    ? searchedOrders
    : showAllOrders
      ? sortedOrders
      : sortedOrders.slice(0, 8);

  const previousOrdersCount = Math.max(sortedOrders.length - 8, 0);

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

      showNotification(
        "Order accepted",
        "success",
        "Order status updated successfully"
      );

      fetchOrders(true);
      window.dispatchEvent(new Event("ordersChanged"));
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to accept order"
      );
    }
  };

  const rejectOrder = (orderId) => {
    setPendingOrderId(orderId);
    setIsPromptOpen(true);
  };

  const confirmRejectOrder = async (reason) => {
    if (!pendingOrderId) return;

    try {
      await api.put(
        `/admin/orders/${pendingOrderId}/reject`,
        { reason: reason?.trim() || "Order rejected by admin" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification(
        "Order rejected",
        "success",
        "Order rejected successfully"
      );

      setIsPromptOpen(false);
      setPendingOrderId(null);
      fetchOrders(true);
      window.dispatchEvent(new Event("ordersChanged"));
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to reject order"
      );
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

      showNotification("Order updated", "success", `Marked as ${status}`);

      fetchOrders(true);
      window.dispatchEvent(new Event("ordersChanged"));
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to update order status"
      );
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
    <PageTransition>
      <div>
        <div className="admin-header">
          <div>
            <h1>Admin Orders Dashboard</h1>
            <p>Manage customer orders and keep the delivery flow moving.</p>
          </div>

          <div className="admin-header-actions">
            <Link to="/admin/menu" className="admin-link-btn">
              Manage Menu
            </Link>

            <Link to="/admin/categories" className="admin-link-btn">
              Manage Categories
            </Link>

            <Link to="/admin/deals" className="admin-link-btn">
              Manage Deals
            </Link>

            <div className="admin-order-search-box">
              <span>🔎</span>
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID"
              />

              {orderSearch && (
                <button
                  type="button"
                  onClick={() => setOrderSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stats">
          <div>
            <strong>Total Orders</strong>
            <span>{orders.length}</span>
          </div>

          <div>
            <strong>Pending</strong>
            <span>
              {orders.filter((order) => order.orderStatus === "Pending").length}
            </span>
          </div>

          <div>
            <strong>Delivered</strong>
            <span>
              {
                orders.filter((order) => order.orderStatus === "Delivered")
                  .length
              }
            </span>
          </div>

          <div>
            <strong>Total Sales</strong>
            <span>
              Rs.{" "}
              {orders
                .filter((order) => order.orderStatus === "Delivered")
                .reduce(
                  (total, order) => total + Number(order.totalAmount || 0),
                  0
                )}
            </span>
          </div>
        </div>

        <div className="admin-orders-toolbar">
          <div>
            <h2>
              {normalizedSearch
                ? "Search Result"
                : showAllOrders
                  ? "All Orders"
                  : "Latest 8 Orders"}
            </h2>

            <p>
              {normalizedSearch
                ? `Showing orders matching "${orderSearch}"`
                : showAllOrders
                  ? "Showing complete order history."
                  : "Showing the newest 8 orders only."}
            </p>
          </div>

          {!normalizedSearch && sortedOrders.length > 8 && (
            <button
              type="button"
              className="show-orders-btn"
              onClick={() => setShowAllOrders((prev) => !prev)}
            >
              {showAllOrders
                ? "Show Latest 8 Orders"
                : `Show All Previous Orders (${previousOrdersCount})`}
            </button>
          )}
        </div>

        {message && <p className="form-message">{message}</p>}

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : visibleOrders.length === 0 ? (
          <div className="admin-no-order-found">
            <h3>No order found with this ID.</h3>
            <p>Check the order ID and try again.</p>
          </div>
        ) : (
          <>
            <div className="admin-orders-grid">
              {visibleOrders.map((order) => (
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

                  <div className="admin-order-items">
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
                            "Order is ready for delivery"
                          )
                        }
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.orderStatus === "Ready" && (
                      <button
                        className="ready-btn"
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Delivered",
                            "Order marked delivered by admin"
                          )
                        }
                      >
                        Mark Delivered
                      </button>
                    )}

                    {order.orderStatus === "Delivered" && (
                      <p className="delivered-text">
                        Order delivered successfully.
                      </p>
                    )}

                    {order.orderStatus === "Rejected" && (
                      <p className="delivered-text">Order rejected.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!normalizedSearch && sortedOrders.length > 8 && (
              <div className="admin-orders-bottom-action">
                <button
                  type="button"
                  className="show-orders-btn"
                  onClick={() => setShowAllOrders((prev) => !prev)}
                >
                  {showAllOrders
                    ? "Show Latest 8 Orders"
                    : `Show All Previous Orders (${previousOrdersCount})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <PromptModal
        isOpen={isPromptOpen}
        title="Reject order"
        message="Enter a short reason so the customer knows why the order was declined."
        label="Rejection reason"
        placeholder="Example: Payment issue"
        confirmText="Reject Order"
        cancelText="Cancel"
        onConfirm={confirmRejectOrder}
        onCancel={() => {
          setIsPromptOpen(false);
          setPendingOrderId(null);
        }}
      />
    </PageTransition>
  );
}

export default AdminDashboard;