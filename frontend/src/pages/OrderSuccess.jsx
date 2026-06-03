import { Link, useLocation } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="checkout-message-box">
      <h1>Order Placed Successfully ✅</h1>

      {order ? (
        <>
          <p>Your order has been sent to Paradise Burger.</p>
          <p>
            <strong>Order Status:</strong> {order.orderStatus}
          </p>
          <p>
            <strong>Total Amount:</strong> Rs. {order.totalAmount}
          </p>
        </>
      ) : (
        <p>Your order has been placed.</p>
      )}

      <Link to="/menu">
        <button>Back to Menu</button>
      </Link>
    </div>
  );
}

export default OrderSuccess;