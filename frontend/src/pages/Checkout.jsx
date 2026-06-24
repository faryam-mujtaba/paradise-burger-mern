import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import PageTransition from "../components/animations/PageTransition";
function Checkout() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, subtotal, deliveryFee, totalAmount, clearCart } = useCart();

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

  if (cartItems.length === 0) {
    return (
      <div className="checkout-message-box">
        <h1>Your Cart is Empty</h1>
        <p>Add food items to cart before checkout.</p>
        <button onClick={() => navigate("/menu")}>Go to Menu</button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.addressLine || !formData.city || !formData.area) {
      setMessage("Please complete your delivery address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        items: cartItems.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          addressLine: formData.addressLine,
          city: formData.city,
          area: formData.area,
        },
        specialInstructions: formData.specialInstructions,
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
            />

            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleChange}
            />

            <label>Area</label>
            <input
              type="text"
              name="area"
              placeholder="Enter area"
              value={formData.area}
              onChange={handleChange}
            />

            <label>Special Instructions</label>
            <textarea
              name="specialInstructions"
              placeholder="Example: Less spicy, call before delivery"
              value={formData.specialInstructions}
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div className="checkout-summary-item" key={item._id}>
                <span>
                  {item.name} x {item.quantity}
                </span>
                <strong>Rs. {item.price * item.quantity}</strong>
              </div>
            ))}

            <hr />

            <p>
              <strong>Subtotal:</strong> Rs. {subtotal}
            </p>
            <p>
              <strong>Delivery Fee:</strong> Rs. {deliveryFee}
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