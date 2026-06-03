import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
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
        </div>

        <div className="hero-card">
          <div className="burger-emoji">🍔</div>
          <h2>Zinger Burger</h2>
          <p>Crispy chicken, fresh salad, special sauce</p>
          <strong>Rs. 450</strong>
        </div>
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
  );
}

export default Home;