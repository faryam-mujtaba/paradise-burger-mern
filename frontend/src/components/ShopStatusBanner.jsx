import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

function ShopStatusBanner() {
  const location = useLocation();
  const [shopStatus, setShopStatus] = useState(null);

  const hideBanner =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/subadmin");

  const fetchShopStatus = async () => {
    try {
      const response = await api.get("/shop/status");
      setShopStatus(response.data.data);
    } catch (error) {
      console.error("SHOP STATUS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchShopStatus();

    const interval = setInterval(fetchShopStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  if (hideBanner) return null;
  if (!shopStatus) return null;

  const isOpen = shopStatus.isOpen === true;

  const message = isOpen
    ? "You can place your order now."
    : shopStatus.closedReason
      ? `Orders are closed right now. Reason: ${shopStatus.closedReason}`
      : "Orders are closed right now. Please check again later.";

  return (
    <div
      className={`shop-status-banner ${
        isOpen ? "shop-status-open" : "shop-status-closed"
      }`}
    >
      <div>
        <strong>{isOpen ? "Shop is Open" : "Shop is Closed"}</strong>
        <span>{message}</span>
      </div>

      <small>
        Timing: {shopStatus.openingTime} - {shopStatus.closingTime}
      </small>
    </div>
  );
}

export default ShopStatusBanner;