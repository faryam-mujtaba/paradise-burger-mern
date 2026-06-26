import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/notification.css";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (title, type = "success", message = "") => {
    setNotification({
      id: Date.now(),
      title,
      type,
      message,
    });

    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            className={`top-notification ${notification.type}`}
            initial={{ opacity: 0, y: -35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.96 }}
            transition={{ duration: 0.25 }}
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