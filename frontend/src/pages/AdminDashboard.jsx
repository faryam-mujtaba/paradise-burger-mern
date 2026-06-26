import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import PromptModal from "../components/PromptModal";
import PageTransition from "../components/animations/PageTransition";
import "../styles/admin.css";
import AdminShopControl from "../components/AdminShopControl";
import AdminReportsPanel from "../components/AdminReportsPanel";
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
  const [activeSummary, setActiveSummary] = useState(null);
  const [summaryMonth, setSummaryMonth] = useState("all");

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

      return (
        fullId.includes(normalizedSearch) ||
        shortId.includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, sortedOrders]);

 const visibleOrders = normalizedSearch
  ? searchedOrders
  : showAllOrders
    ? sortedOrders
    : sortedOrders.slice(0, 8);

const isSearching = Boolean(normalizedSearch);

const previousOrdersCount = Math.max(sortedOrders.length - 8, 0);

  const getOrderShortId = (order) =>
    order._id?.slice(-6).toUpperCase() || "N/A";

  const statusCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      Accepted: 0,
      Preparing: 0,
      Ready: 0,
      Delivered: 0,
      Rejected: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.orderStatus || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return sortedOrders.filter((order) => order.orderStatus === "Pending");
  }, [sortedOrders]);

  const deliveredOrders = useMemo(() => {
    return sortedOrders.filter((order) => order.orderStatus === "Delivered");
  }, [sortedOrders]);

  const allDeliveredRevenue = useMemo(() => {
    return deliveredOrders.reduce(
      (total, order) => total + Number(order.totalAmount || 0),
      0
    );
  }, [deliveredOrders]);

  const monthOptions = useMemo(() => {
    const months = new Map();

    deliveredOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const label = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      months.set(key, label);
    });

    const sortedMonths = Array.from(months, ([value, label]) => ({
      value,
      label,
    })).sort((a, b) => b.value.localeCompare(a.value));

    return [{ value: "all", label: "All time" }, ...sortedMonths];
  }, [deliveredOrders]);

  const filteredSalesOrders = useMemo(() => {
    if (summaryMonth === "all") return deliveredOrders;

    return deliveredOrders.filter((order) => {
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return false;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      return key === summaryMonth;
    });
  }, [deliveredOrders, summaryMonth]);

  const salesSummary = useMemo(() => {
    const dealMap = new Map();
    const menuMap = new Map();

    let totalOrderRevenue = 0;

    filteredSalesOrders.forEach((order) => {
      totalOrderRevenue += Number(order.totalAmount || 0);

      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Item";
        const quantity = Number(item.quantity || 0);
        const revenue = Number(item.price || 0) * quantity;

        const targetMap = item.itemType === "deal" ? dealMap : menuMap;

        if (!targetMap.has(name)) {
          targetMap.set(name, {
            name,
            quantity: 0,
            revenue: 0,
          });
        }

        const existing = targetMap.get(name);
        existing.quantity += quantity;
        existing.revenue += revenue;
      });
    });

    const sortByRevenue = (map) =>
      Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);

    return {
      totalOrderRevenue,
      dealBreakdown: sortByRevenue(dealMap),
      menuBreakdown: sortByRevenue(menuMap),
    };
  }, [filteredSalesOrders]);

  const closeSummary = () => {
    setActiveSummary(null);
  };

  const renderSmallOrderRow = (order) => (
    <div className="admin-summary-order-row" key={order._id}>
      <div>
        <strong>Order #{getOrderShortId(order)}</strong>
        <span>
          {order.customerSnapshot?.fullName ||
            order.customer?.fullName ||
            "Customer"}
        </span>
      </div>

      <div>
        <b>Rs. {order.totalAmount}</b>
        <small>{order.orderStatus}</small>
      </div>
    </div>
  );

  const renderSummaryContent = () => {
    if (activeSummary === "total") {
      return (
        <>
          <div className="admin-summary-grid">
            <div>
              <strong>{orders.length}</strong>
              <span>Total Orders</span>
            </div>

            <div>
              <strong>{statusCounts.Pending}</strong>
              <span>Pending</span>
            </div>

            <div>
              <strong>
                {statusCounts.Accepted +
                  statusCounts.Preparing +
                  statusCounts.Ready}
              </strong>
              <span>In Progress</span>
            </div>

            <div>
              <strong>{statusCounts.Delivered}</strong>
              <span>Delivered</span>
            </div>

            <div>
              <strong>{statusCounts.Rejected + statusCounts.Cancelled}</strong>
              <span>Rejected / Cancelled</span>
            </div>

            <div>
              <strong>Rs. {allDeliveredRevenue}</strong>
              <span>Delivered Revenue</span>
            </div>
          </div>

          <h3>Latest Orders</h3>
          {sortedOrders.slice(0, 6).map(renderSmallOrderRow)}
        </>
      );
    }

    if (activeSummary === "pending") {
      return (
        <>
          <div className="admin-summary-grid">
            <div>
              <strong>{pendingOrders.length}</strong>
              <span>Pending Orders</span>
            </div>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="admin-summary-empty">No pending orders right now.</p>
          ) : (
            pendingOrders.map(renderSmallOrderRow)
          )}
        </>
      );
    }

    if (activeSummary === "delivered") {
      return (
        <>
          <div className="admin-summary-grid">
            <div>
              <strong>{deliveredOrders.length}</strong>
              <span>Delivered Orders</span>
            </div>

            <div>
              <strong>Rs. {allDeliveredRevenue}</strong>
              <span>Total Delivered Sales</span>
            </div>
          </div>

          <h3>Recent Delivered Orders</h3>
          {deliveredOrders.slice(0, 10).map(renderSmallOrderRow)}
        </>
      );
    }

    if (activeSummary === "sales") {
      return (
        <>
          <div className="admin-summary-filter">
            <label>Sales Period</label>

            <select
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(e.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-summary-grid">
            <div>
              <strong>{filteredSalesOrders.length}</strong>
              <span>Delivered Orders</span>
            </div>

            <div>
              <strong>Rs. {salesSummary.totalOrderRevenue}</strong>
              <span>Total Sales</span>
            </div>
          </div>

          <p className="admin-summary-note">
            Sales are calculated from delivered order totals, so customer
            selected items, deals, and saved order prices are included.
          </p>

          <h3>Deal Sales</h3>

          {salesSummary.dealBreakdown.length === 0 ? (
            <p className="admin-summary-empty">
              No deal sales in this period.
            </p>
          ) : (
            salesSummary.dealBreakdown.map((item) => (
              <div className="admin-summary-order-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Quantity sold: {item.quantity}</span>
                </div>

                <div>
                  <b>Rs. {item.revenue}</b>
                  <small>Deal revenue</small>
                </div>
              </div>
            ))
          )}

          <h3>Menu / Custom Item Sales</h3>

          {salesSummary.menuBreakdown.length === 0 ? (
            <p className="admin-summary-empty">
              No menu item sales in this period.
            </p>
          ) : (
            salesSummary.menuBreakdown.map((item) => (
              <div className="admin-summary-order-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Quantity sold: {item.quantity}</span>
                </div>

                <div>
                  <b>Rs. {item.revenue}</b>
                  <small>Item revenue</small>
                </div>
              </div>
            ))
          )}
        </>
      );
    }

    return null;
  };

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
  onChange={(e) => {
    
    setOrderSearch(e.target.value);
    setShowAllOrders(false);
  }}
  placeholder="Search order ID"
/>

              {orderSearch && (
               <button
  type="button"
  onClick={() => {
    setOrderSearch("");
    setShowAllOrders(false);
  }}
  aria-label="Clear search"
>
  ×
</button>
              )}
            </div>
          </div>
        </div>
       {!isSearching && (
  <>
    <AdminShopControl token={token} />

    <AdminReportsPanel token={token} />

    <div className="admin-stats">
      <button
        type="button"
        className="admin-stat-card"
        onClick={() => setActiveSummary("total")}
      >
        <strong>Total Orders</strong>
        <span>{orders.length}</span>
        <small>Click for summary</small>
      </button>

      <button
        type="button"
        className="admin-stat-card"
        onClick={() => setActiveSummary("pending")}
      >
        <strong>Pending</strong>
        <span>{statusCounts.Pending}</span>
        <small>View pending orders</small>
      </button>

      <button
        type="button"
        className="admin-stat-card"
        onClick={() => setActiveSummary("delivered")}
      >
        <strong>Delivered</strong>
        <span>{statusCounts.Delivered}</span>
        <small>View delivered orders</small>
      </button>

      <button
        type="button"
        className="admin-stat-card"
        onClick={() => setActiveSummary("sales")}
      >
        <strong>Total Sales</strong>
        <span>Rs. {allDeliveredRevenue}</span>
        <small>View sales report</small>
      </button>
    </div>
  </>
)}
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

        {activeSummary && (
          <div className="admin-summary-overlay" onClick={closeSummary}>
            <div
              className="admin-summary-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-summary-header">
                <div>
                  <span>📊 Admin Report</span>

                  <h2>
                    {activeSummary === "total" && "Total Orders Summary"}
                    {activeSummary === "pending" && "Pending Orders Summary"}
                    {activeSummary === "delivered" &&
                      "Delivered Orders Summary"}
                    {activeSummary === "sales" && "Total Sales Report"}
                  </h2>
                </div>

                <button type="button" onClick={closeSummary}>
                  ×
                </button>
              </div>

              <div className="admin-summary-body">
                {renderSummaryContent()}
              </div>
            </div>
          </div>
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