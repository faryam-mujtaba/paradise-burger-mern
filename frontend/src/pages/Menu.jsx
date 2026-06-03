import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Menu() {
  const { addToCart, cartItems } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notification, setNotification] = useState(null);
  const [addedItemId, setAddedItemId] = useState("");

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/menu");
      setMenuItems(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load menu items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((cartItem) => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (item) => {
    addToCart(item);

    const previousQuantity = getItemQuantity(item._id);
    const newQuantity = previousQuantity + 1;

    setNotification({
      itemName: item.name,
      quantity: newQuantity,
    });

    setAddedItemId(item._id);

    setTimeout(() => {
      setNotification(null);
      setAddedItemId("");
    }, 1800);
  };

  if (loading) {
    return <h2>Loading menu...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      {notification && (
        <div className="cart-notification">
          <div className="cart-notification-icon">✓</div>

          <div>
            <strong>{notification.itemName}</strong>
            <span>
              Added to cart · Quantity: {notification.quantity}
            </span>
          </div>
        </div>
      )}

      <h1>Paradise Burger Menu</h1>

      {menuItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => {
            const itemQuantity = getItemQuantity(item._id);
            const isAdded = addedItemId === item._id;

            return (
              <div className="menu-card" key={item._id}>
                <div className="menu-image-box">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="menu-image"
                    />
                  ) : (
                    <div className="menu-image-placeholder">🍔</div>
                  )}
                </div>

                <div className="menu-name-badge">{item.name}</div>

                <div className="menu-details">
                  <p>{item.description}</p>

                  <p>
                    <strong>Category:</strong> {item.category?.name}
                  </p>

                  <p>
                    <strong>Price:</strong> Rs. {item.price}
                  </p>

                  <p>
                    <strong>Preparation Time:</strong> {item.preparationTime} min
                  </p>

                  {itemQuantity > 0 && (
                    <p className="item-cart-status">
                      In cart: {itemQuantity} item{itemQuantity > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <button
                  className={isAdded ? "cart-btn cart-btn-added" : "cart-btn"}
                  onClick={() => handleAddToCart(item)}
                >
                  {isAdded ? "Added to Cart ✓" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Menu;