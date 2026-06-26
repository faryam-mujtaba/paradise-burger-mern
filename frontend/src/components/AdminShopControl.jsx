import { useEffect, useState } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

function AdminShopControl({ token }) {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shop, setShop] = useState(null);

  const [form, setForm] = useState({
    openingTime: "17:00",
    closingTime: "05:00",
    businessDayStartTime: "17:00",
    mode: "auto",
    allowOrders: true,
    closedUntil: "",
    closedReason: "",
    customerMessage: "",
    timezoneOffsetMinutes: 300,
  });

  const toDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const fetchShopSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/shop/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.data;

      setShop(data);

      setForm({
        openingTime: data.openingTime || "17:00",
        closingTime: data.closingTime || "05:00",
        businessDayStartTime: data.businessDayStartTime || "17:00",
        mode: data.mode || "auto",
        allowOrders: data.allowOrders !== false,
        closedUntil: toDateTimeLocal(data.closedUntil),
        closedReason: data.closedReason || "",
        customerMessage: data.customerMessage || "",
        timezoneOffsetMinutes: data.timezoneOffsetMinutes || 300,
      });
    } catch (error) {
      showNotification(
        "Shop settings error",
        "error",
        error.response?.data?.message || "Failed to load shop settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        timezoneOffsetMinutes: Number(form.timezoneOffsetMinutes),
        closedUntil: form.closedUntil ? form.closedUntil : null,
      };

      const response = await api.put("/shop/settings", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShop(response.data.data);

      showNotification(
        "Shop settings saved",
        "success",
        "Shop timing and status updated successfully"
      );

      fetchShopSettings();
    } catch (error) {
      showNotification(
        "Save failed",
        "error",
        error.response?.data?.message || "Failed to update shop settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const openShopNow = async () => {
    try {
      setSaving(true);

      await api.put(
        "/shop/open",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification("Shop opened", "success", "Shop is now manually open");
      fetchShopSettings();
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to open shop"
      );
    } finally {
      setSaving(false);
    }
  };

  const closeShopNow = async () => {
    try {
      setSaving(true);

      await api.put(
        "/shop/close",
        {
          closedUntil: form.closedUntil || null,
          closedReason: form.closedReason,
          customerMessage:
            form.customerMessage ||
            "Shop is currently closed. Please check again later.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification("Shop closed", "success", "Shop is now manually closed");
      fetchShopSettings();
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to close shop"
      );
    } finally {
      setSaving(false);
    }
  };

  const setAutoMode = async () => {
    try {
      setSaving(true);

      await api.put(
        "/shop/auto",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification(
        "Auto timing enabled",
        "success",
        "Shop will now follow saved opening and closing time"
      );

      fetchShopSettings();
    } catch (error) {
      showNotification(
        "Error",
        "error",
        error.response?.data?.message || "Failed to set auto mode"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-shop-panel">
        <p>Loading shop controls...</p>
      </div>
    );
  }

  return (
    <div className="admin-shop-panel">
      <div className="admin-shop-top">
        <div>
          <span className="admin-shop-kicker">Shop Control</span>
          <h2>Opening / Closing Settings</h2>
          <p>
            Admin can manually open, close, or set automatic shop timing. Orders
            are blocked from backend when shop is closed.
          </p>
        </div>

        <div
          className={`admin-shop-status ${
            shop?.isOpenNow ? "shop-open" : "shop-closed"
          }`}
        >
          <strong>{shop?.isOpenNow ? "Open Now" : "Closed Now"}</strong>
          <span>{shop?.runtimeMessage || "No status message"}</span>
        </div>
      </div>

      <div className="admin-shop-grid">
        <label>
          Opening Time
          <input
            type="time"
            name="openingTime"
            value={form.openingTime}
            onChange={handleChange}
          />
        </label>

        <label>
          Closing Time
          <input
            type="time"
            name="closingTime"
            value={form.closingTime}
            onChange={handleChange}
          />
        </label>

        <label>
          Business Day Start
          <input
            type="time"
            name="businessDayStartTime"
            value={form.businessDayStartTime}
            onChange={handleChange}
          />
        </label>

        <label>
          Shop Mode
          <select name="mode" value={form.mode} onChange={handleChange}>
            <option value="auto">Auto Timing</option>
            <option value="forceOpen">Force Open</option>
            <option value="forceClosed">Force Closed</option>
          </select>
        </label>

        <label>
          Closed Until
          <input
            type="datetime-local"
            name="closedUntil"
            value={form.closedUntil}
            onChange={handleChange}
          />
        </label>

        <label>
          Timezone Offset
          <select
            name="timezoneOffsetMinutes"
            value={form.timezoneOffsetMinutes}
            onChange={handleChange}
          >
            <option value={300}>Pakistan Time UTC+5</option>
            <option value={0}>UTC</option>
          </select>
        </label>
      </div>

      <div className="admin-shop-message-grid">
        <label>
          Closed Reason
          <input
            type="text"
            name="closedReason"
            value={form.closedReason}
            onChange={handleChange}
            placeholder="Example: Maintenance, staff break, stock finished"
            maxLength={120}
          />
        </label>

        <label>
          Customer Message
          <input
            type="text"
            name="customerMessage"
            value={form.customerMessage}
            onChange={handleChange}
            placeholder="Message customers will see"
            maxLength={160}
          />
        </label>
      </div>

      <label className="admin-shop-checkbox">
        <input
          type="checkbox"
          name="allowOrders"
          checked={form.allowOrders}
          onChange={handleChange}
        />
        Allow orders
      </label>

      <div className="admin-shop-actions">
        <button type="button" onClick={saveSettings} disabled={saving}>
          Save Settings
        </button>

        <button
          type="button"
          className="shop-open-btn"
          onClick={openShopNow}
          disabled={saving}
        >
          Open Shop Now
        </button>

        <button
          type="button"
          className="shop-close-btn"
          onClick={closeShopNow}
          disabled={saving}
        >
          Close Shop Now
        </button>

        <button
          type="button"
          className="shop-auto-btn"
          onClick={setAutoMode}
          disabled={saving}
        >
          Auto Timing
        </button>
      </div>
    </div>
  );
}

export default AdminShopControl;