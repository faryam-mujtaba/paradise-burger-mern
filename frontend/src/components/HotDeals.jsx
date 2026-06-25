import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "../styles/deals.css";

const backendHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "localhost"
    : window.location.hostname;

const backendRoot = `http://${backendHost}:5000`;

function HotDeals() {
  const { addToCart } = useCart();

  const [deals, setDeals] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${backendRoot}${image}`;
  };

  const fetchActiveDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deals/active");
      setDeals(response.data.data || []);
    } catch (error) {
      console.error("FETCH HOT DEALS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDeals();
  }, []);

  useEffect(() => {
    if (deals.length <= 1) return;

    const slider = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === deals.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(slider);
  }, [deals]);

  const handleAddDealToCart = (deal) => {
    addToCart({
      ...deal,
      itemType: "deal",
    });

    setCartMessage(`${deal.title} added to cart`);

    setTimeout(() => {
      setCartMessage("");
    }, 1800);
  };

  if (loading || deals.length === 0) {
    return null;
  }

  return (
    <section className="hot-slider-section">
      <div className="hot-slider-heading">
        <span>🔥 Limited Time Offers</span>
        <h2>Hot Deals</h2>
      </div>

      {cartMessage && <div className="hot-cart-message">{cartMessage}</div>}

      <div className="hot-slider-window">
        <div
          className="hot-slider-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {deals.map((deal) => (
            <div className="hot-slide" key={deal._id}>
              <div className="hot-slide-content">
                <div className="hot-slide-text">
                  <div className="hot-offer-tag">HOT DEAL</div>

                  <h3>{deal.title}</h3>
                  <p className="hot-slide-desc">{deal.description}</p>

                  <p className="hot-slide-items">
                    <strong>Includes:</strong> {deal.itemsIncluded}
                  </p>

                  <div className="hot-slide-price">
                    <span className="hot-slide-old">
                      Rs {deal.originalPrice}
                    </span>
                    <span className="hot-slide-new">Rs {deal.dealPrice}</span>
                  </div>

                  <button
                    type="button"
                    className="hot-add-cart-btn"
                    onClick={() => handleAddDealToCart(deal)}
                  >
                    Add Deal to Cart
                  </button>
                </div>

                <div className="hot-slide-image">
                  <div className="hot-image-badge">HOT</div>

                  {deal.image ? (
                    <img src={getImageUrl(deal.image)} alt={deal.title} />
                  ) : (
                    <span>🍔</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deals.length > 1 && (
        <div className="hot-slider-dots">
          {deals.map((deal, index) => (
            <button
              key={deal._id}
              type="button"
              className={index === activeIndex ? "active-dot" : ""}
              onClick={() => setActiveIndex(index)}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}

export default HotDeals;