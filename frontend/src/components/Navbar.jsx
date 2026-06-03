import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Paradise Burger</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>

        {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        {user?.role === "rider" && <Link to="/rider">Rider Dashboard</Link>}

        <Link to="/cart" className="cart-nav-link">
          Cart
          <span className="cart-count-badge">{cartCount}</span>
        </Link>

        {user ? (
          <>
            <span className="nav-user">
              {user.fullName} ({user.role})
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;