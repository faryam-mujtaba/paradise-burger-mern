import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/notification.css";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const showNotification = useCallback(
    (title, type = "success", message = "", action = null) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setNotification({
        id: Date.now(),
        title,
        type,
        message,
        action,
      });

      timeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 4000);
    },
    []
  );

  const handleNotificationClick = () => {
    if (notification?.action) {
      notification.action();
      setNotification(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            className={`top-notification ${notification.type} ${
              notification.action ? "clickable-notification" : ""
            }`}
            initial={{ opacity: 0, y: -35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={handleNotificationClick}
            role={notification.action ? "button" : "alert"}
          >
            <span className="notification-icon">
              {notification.type === "success" ? "✓" : "!"}
            </span>

            <div className="notification-text">
              <span className="notification-title">{notification.title}</span>

              {notification.message && (
                <span className="notification-message">
                  {notification.message}
                </span>
              )}

              {notification.action && (
                <span className="notification-action-text">
                  Click to view order
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}