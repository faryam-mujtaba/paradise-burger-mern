import { useEffect, useState } from "react";
import api from "../services/api";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <h2>Loading menu...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Paradise Burger Menu</h1>

      {menuItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div className="menu-card" key={item._id}>
              <div className="menu-image-box">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="menu-image" />
                ) : (
                  <div className="menu-image-placeholder">
                    🍔
                  </div>
                )}
              </div>

              <div className="menu-name-badge">
                {item.name}
              </div>

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
              </div>

              <button className="cart-btn">Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;