import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/animations/PageTransition";

function Home() {
  return (
    <PageTransition>
      <div className="home-page">
        <section className="hero-section">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="hero-badge">Fresh • Fast • Delicious</p>

            <h1>
              Welcome to <span>Paradise Burger</span>
            </h1>

            <p className="hero-text">
              Enjoy juicy burgers, crispy fries, shawarma, platters, cold drinks,
              and special deals delivered fresh to your doorstep.
            </p>

            <div className="hero-buttons">
              <Link to="/menu" className="primary-btn">
                Order Now
              </Link>

              <Link to="/menu" className="secondary-btn">
                View Menu
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-image-box"
            initial={{ opacity: 0, x: 45, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <img
              src="/images/restaurant-hero.jpg"
              alt="Paradise Burger restaurant food"
              className="hero-image"
            />

            <motion.div
              className="floating-card floating-card-top"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <strong>⚡ Fast Delivery</strong>
              <span>Hot & fresh food</span>
            </motion.div>

            <motion.div
              className="floating-card floating-card-bottom"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <strong>🍔 Best Burgers</strong>
              <span>Freshly prepared</span>
            </motion.div>
          </motion.div>
        </section>

        <section className="home-categories">
          <h2>Popular Categories</h2>

          <div className="category-grid">
            <div className="home-category-card">
              <span>🍔</span>
              <h3>Burgers</h3>
              <p>Juicy and crispy burgers</p>
            </div>

            <div className="home-category-card">
              <span>🌯</span>
              <h3>Shawarma</h3>
              <p>Fresh chicken shawarma</p>
            </div>

            <div className="home-category-card">
              <span>🍟</span>
              <h3>Fries</h3>
              <p>Crispy golden fries</p>
            </div>

            <div className="home-category-card">
              <span>🥤</span>
              <h3>Cold Drinks</h3>
              <p>Chilled drinks with meals</p>
            </div>
          </div>
        </section>

        <section className="home-features">
          <div>
            <h3>⚡ Fast Delivery</h3>
            <p>Your food reaches you fresh and hot.</p>
          </div>

          <div>
            <h3>🍽️ Fresh Food</h3>
            <p>Prepared with quality ingredients.</p>
          </div>

          <div>
            <h3>💵 Cash on Delivery</h3>
            <p>Pay easily when your order arrives.</p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default Home;