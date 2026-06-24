import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import PageTransition from "../components/animations/PageTransition";
import MotionButton from "../components/animations/MotionButton";
import { motion } from "framer-motion";
function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    totalAmount,
  } = useCart();

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

        <div className="cart-list">
         {cartItems.map((item, index) => (
  <motion.div
    className="cart-item"
    key={item._id}
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.07 }}
  >
              <div>
                <h3>{item.name}</h3>
                <p>Rs. {item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>

              <div className="cart-actions">
                <MotionButton onClick={() => decreaseQuantity(item._id)}>-</MotionButton>

                <MotionButton onClick={() => increaseQuantity(item._id)}>+</MotionButton>

                <MotionButton onClick={() => removeFromCart(item._id)}>
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

          <p>
            <strong>Delivery Fee:</strong> Rs. {deliveryFee}
          </p>

          <h2>Total: Rs. {totalAmount}</h2>

          <div className="cart-bottom-actions">
            <MotionButton className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </MotionButton>

            <MotionButton
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </MotionButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );

}

export default Cart;