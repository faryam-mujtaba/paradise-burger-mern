import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function OrderStatusWatcher() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const previousOrdersRef = useRef(new Map());
  const firstCheckRef = useRef(true);

  useEffect(() => {
    previousOrdersRef.current = new Map();
    firstCheckRef.current = true;

    if (!user) return;

    if (!["customer", "admin", "subadmin"].includes(user.role)) return;

    const getOrdersUrl = () => {
      if (user.role === "customer") {
        return "/orders/my-orders";
      }

      if (user.role === "admin" || user.role === "subadmin") {
        return "/admin/orders";
      }

      return "";
    };

    const getTargetPage = () => {
      if (user.role === "customer") {
        return "/my-orders";
      }

      if (user.role === "admin") {
        return "/admin/dashboard";
      }

      if (user.role === "subadmin") {
        return "/subadmin/orders";
      }

      return "/";
    };

    const goToOrdersPage = () => {
      window.dispatchEvent(new Event("ordersChanged"));
      navigate(getTargetPage());
    };

    const getOrderStatus = (order) => {
      return order.orderStatus || order.status || "Pending";
    };

    const getOrderCode = (orderId) => {
      return orderId.slice(-6).toUpperCase();
    };

    const notifyPagesToRefresh = () => {
      window.dispatchEvent(new Event("ordersChanged"));
    };

    const checkOrders = async () => {
      try {
        const response = await api.get(getOrdersUrl());

        const orders =
          response.data.data || response.data.orders || response.data || [];

        if (!Array.isArray(orders)) return;

        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const currentOrdersMap = new Map();

        sortedOrders.forEach((order) => {
          currentOrdersMap.set(order._id, getOrderStatus(order));
        });

        if (firstCheckRef.current) {
          previousOrdersRef.current = currentOrdersMap;
          firstCheckRef.current = false;
          return;
        }

        const previousOrdersMap = previousOrdersRef.current;

        if (user.role === "customer") {
          sortedOrders.forEach((order) => {
            const oldStatus = previousOrdersMap.get(order._id);
            const newStatus = getOrderStatus(order);

            if (oldStatus && oldStatus !== newStatus) {
              notifyPagesToRefresh();

              showNotification(
                "Order progress updated",
                "success",
                `Order #${getOrderCode(order._id)} is now ${newStatus}`,
                goToOrdersPage
              );
            }
          });
        }

        if (user.role === "admin" || user.role === "subadmin") {
          const newOrders = sortedOrders.filter(
            (order) => !previousOrdersMap.has(order._id)
          );

          if (newOrders.length > 0) {
            const latestOrder = newOrders[0];

            notifyPagesToRefresh();

            showNotification(
              "New order received",
              "success",
              `Order #${getOrderCode(latestOrder._id)} is pending`,
              goToOrdersPage
            );
          }
        }

        if (user.role === "admin") {
          sortedOrders.forEach((order) => {
            const oldStatus = previousOrdersMap.get(order._id);
            const newStatus = getOrderStatus(order);

            if (oldStatus && oldStatus !== newStatus) {
              notifyPagesToRefresh();

              showNotification(
                "Order status changed",
                "success",
                `Order #${getOrderCode(order._id)} is now ${newStatus}`,
                goToOrdersPage
              );
            }
          });
        }

        previousOrdersRef.current = currentOrdersMap;
      } catch (error) {
        console.error("ORDER STATUS WATCHER ERROR:", error);
      }
    };

    checkOrders();

    const interval = setInterval(() => {
      checkOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?._id, user?.role, navigate, showNotification]);

  return null;
}

export default OrderStatusWatcher;