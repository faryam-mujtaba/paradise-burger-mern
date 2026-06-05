import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

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
      <div>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Cart</h1>

      <div className="cart-list">
        {cartItems.map((item) => (
          <div className="cart-item" key={item._id}>
            <div>
              <h3>{item.name}</h3>
              <p>Rs. {item.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>

            <div className="cart-actions">
              <button onClick={() => decreaseQuantity(item._id)}>-</button>
              <button onClick={() => increaseQuantity(item._id)}>+</button>
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          </div>
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
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>

          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;