import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import PageTransition from "../components/animations/PageTransition";
import MotionButton from "../components/animations/MotionButton";

function Cart() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalAmount,
  } = useCart();

  const [shopStatus, setShopStatus] = useState(null);
  const [shopStatusLoading, setShopStatusLoading] = useState(true);

  const fetchShopStatus = async () => {
    try {
      setShopStatusLoading(true);

      const response = await api.get("/shop/status");
      setShopStatus(response.data.data);
    } catch (error) {
      console.error("CART SHOP STATUS ERROR:", error);
      setShopStatus(null);
    } finally {
      setShopStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchShopStatus();

    const interval = setInterval(fetchShopStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const isShopOpen = shopStatus?.isOpen === true;

  const getShopMessage = () => {
    if (shopStatusLoading) {
      return "Checking shop status...";
    }

    if (!shopStatus) {
      return "Unable to check shop status. Please refresh the page.";
    }

    if (isShopOpen) {
      return "Shop is open now. You can continue to checkout.";
    }

    if (shopStatus.closedReason) {
      return `Shop is closed right now. Reason: ${shopStatus.closedReason}`;
    }

    return "Shop is closed right now. Orders are not available.";
  };

  const handleCheckout = () => {
    if (shopStatusLoading) {
      showNotification("Please wait", "info", "Checking shop status...");
      return;
    }

    if (!isShopOpen) {
      showNotification("Shop is closed", "error", getShopMessage());
      return;
    }

    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div>
          <h1>Your Cart</h1>
          <p>Your cart is empty.</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div>
        <h1>Your Cart</h1>

        <div
          className={`cart-shop-status ${
            isShopOpen ? "cart-shop-open" : "cart-shop-closed"
          }`}
        >
          <strong>{isShopOpen ? "Shop is Open" : "Shop is Closed"}</strong>
          <span>{getShopMessage()}</span>
        </div>

        <div className="cart-list">
          {cartItems.map((item, index) => (
            <motion.div
              className="cart-item"
              key={item.cartId || item._id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.07 }}
            >
              <div>
                <h3>{item.name}</h3>

                <p className="cart-type-badge">
                  {item.itemType === "deal" ? "Hot Deal" : "Menu Item"}
                </p>

                <p>Rs. {item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>

              <div className="cart-actions">
                <MotionButton onClick={() => decreaseQuantity(item.cartId)}>
                  -
                </MotionButton>

                <MotionButton onClick={() => increaseQuantity(item.cartId)}>
                  +
                </MotionButton>

                <MotionButton onClick={() => removeFromCart(item.cartId)}>
                  Remove
                </MotionButton>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="cart-summary">
          <p>
            <strong>Subtotal:</strong> Rs. {subtotal}
          </p>

          <h2>Total: Rs. {totalAmount}</h2>

          <div className="cart-bottom-actions">
            <MotionButton className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </MotionButton>

            <button
              type="button"
              className="checkout-btn cart-checkout-button"
              onClick={handleCheckout}
              disabled={shopStatusLoading || !isShopOpen}
            >
              {shopStatusLoading
                ? "Checking Shop..."
                : isShopOpen
                  ? "Proceed to Checkout"
                  : "Shop Closed"}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Cart;