import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import PageTransition from "../components/animations/PageTransition";

const LIMITS = {
  addressLine: 120,
  city: 40,
  area: 60,
  specialInstructions: 180,
};

function Checkout() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, subtotal, totalAmount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    addressLine: "",
    city: "",
    area: "",
    specialInstructions: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <PageTransition>
        <div className="checkout-message-box">
          <h1>Login Required</h1>
          <p>Please login or create an account before placing your order.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </PageTransition>
    );
  }

  if (user.role !== "customer") {
    return (
      <PageTransition>
        <div className="checkout-message-box">
          <h1>Access Denied</h1>
          <p>Only customers can place orders.</p>
          <button onClick={() => navigate("/menu")}>Back to Menu</button>
        </div>
      </PageTransition>
    );
  }

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div className="checkout-message-box">
          <h1>Your Cart is Empty</h1>
          <p>Add food items to cart before checkout.</p>
          <button onClick={() => navigate("/menu")}>Go to Menu</button>
        </div>
      </PageTransition>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    const maxLength = LIMITS[name];

    if (maxLength && value.length > maxLength) {
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateCheckoutForm = () => {
    const addressLine = formData.addressLine.trim();
    const city = formData.city.trim();
    const area = formData.area.trim();
    const specialInstructions = formData.specialInstructions.trim();

    if (!addressLine || !city || !area) {
      return "Please complete your delivery address.";
    }

    if (addressLine.length < 8) {
      return "Address must be at least 8 characters.";
    }

    if (city.length < 2) {
      return "City name is too short.";
    }

    if (area.length < 2) {
      return "Area name is too short.";
    }

    if (addressLine.length > LIMITS.addressLine) {
      return `Address cannot be more than ${LIMITS.addressLine} characters.`;
    }

    if (city.length > LIMITS.city) {
      return `City cannot be more than ${LIMITS.city} characters.`;
    }

    if (area.length > LIMITS.area) {
      return `Area cannot be more than ${LIMITS.area} characters.`;
    }

    if (specialInstructions.length > LIMITS.specialInstructions) {
      return `Special instructions cannot be more than ${LIMITS.specialInstructions} characters.`;
    }

    return "";
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (user?.role === "customer" && !user?.isEmailVerified) {
      alert("Please verify your email before placing an order.");
      return;
    }

    const validationError = validateCheckoutForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        items: cartItems.map((item) => ({
          itemType: item.itemType || "menu",
          menuItem: item.itemType === "deal" ? null : item._id,
          deal: item.itemType === "deal" ? item._id : null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          addressLine: formData.addressLine.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
        },
        specialInstructions: formData.specialInstructions.trim(),
      };

      const response = await api.post("/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearCart();

      navigate("/order-success", {
        state: {
          order: response.data.data,
        },
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to place order. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div>
        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <h2>Delivery Details</h2>

            {message && <p className="form-message">{message}</p>}

            <label>Address</label>
            <input
              type="text"
              name="addressLine"
              placeholder="Street, house number, nearby place"
              value={formData.addressLine}
              onChange={handleChange}
              maxLength={LIMITS.addressLine}
            />
            <small className="char-limit">
              {formData.addressLine.length}/{LIMITS.addressLine} characters
            </small>

            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleChange}
              maxLength={LIMITS.city}
            />
            <small className="char-limit">
              {formData.city.length}/{LIMITS.city} characters
            </small>

            <label>Area</label>
            <input
              type="text"
              name="area"
              placeholder="Enter area"
              value={formData.area}
              onChange={handleChange}
              maxLength={LIMITS.area}
            />
            <small className="char-limit">
              {formData.area.length}/{LIMITS.area} characters
            </small>

            <label>Special Instructions</label>
            <textarea
              name="specialInstructions"
              placeholder="Example: Less spicy, call before delivery"
              value={formData.specialInstructions}
              onChange={handleChange}
              maxLength={LIMITS.specialInstructions}
            />
            <small className="char-limit">
              {formData.specialInstructions.length}/{LIMITS.specialInstructions} characters
            </small>

            <button type="submit" disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div className="checkout-summary-item" key={item.cartId || item._id}>
                <span>
                  {item.name} x {item.quantity}
                  {item.itemType === "deal" && (
                    <small className="checkout-deal-label"> Hot Deal</small>
                  )}
                </span>

                <strong>Rs. {item.price * item.quantity}</strong>
              </div>
            ))}

            <hr />

            <p>
              <strong>Subtotal:</strong> Rs. {subtotal}
            </p>

            <h2>Total: Rs. {totalAmount}</h2>

            <p className="cod-note">Payment Method: Cash on Delivery</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Checkout;