import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import PageTransition from "../components/animations/PageTransition";
import { motion } from "framer-motion";
import MotionButton from "../components/animations/MotionButton";
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

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
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
    <PageTransition>
      <div>

        {notification && (
          <div className="cart-notification">
            <div className="cart-notification-icon">✓</div>

            <div>
              <strong>{notification.itemName}</strong>
              <span>Added to cart · Quantity: {notification.quantity}</span>
            </div>
          </div>
        )}

        <h1>Paradise Burger Menu</h1>

        {menuItems.length === 0 ? (
          <p>No menu items available.</p>
        ) : (
          <div className="menu-grid">
            {menuItems.map((item, index) => {
              const itemQuantity = getItemQuantity(item._id);
              const isAdded = addedItemId === item._id;

              return (

                <motion.div
                  className="menu-card"
                  key={item._id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <div className="menu-image-box">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
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

                    {item.preparationTime && (
                      <p>
                        <strong>Preparation Time:</strong>{" "}
                        {item.preparationTime} min
                      </p>
                    )}

                    {itemQuantity > 0 && (
                      <p className="item-cart-status">
                        In cart: {itemQuantity} item
                        {itemQuantity > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  <MotionButton
                    className={isAdded ? "cart-btn cart-btn-added" : "cart-btn"}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.isAvailable}
                  >
                    {!item.isAvailable
                      ? "Not Available"
                      : isAdded
                        ? "Added to Cart ✓"
                        : "Add to Cart"}
                  </MotionButton>
                </motion.div>

              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );


}

export default Menu;