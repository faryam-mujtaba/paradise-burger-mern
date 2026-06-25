import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

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
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="navbar-logo">
        <Link to="/">Paradise Burger</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>

        {user?.role === "customer" && (
          <>
            <Link to="/my-orders">My Orders</Link>

            <Link to="/cart" className="cart-nav-link">
              Cart
              <span className="cart-count-badge">{cartCount}</span>
            </Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/menu">Menu Management</Link>
            <Link to="/admin/categories">Categories</Link>
          </>
        )}

        {user ? (
          <>
            <Link to="/change-password">Change Password</Link>

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
    </motion.nav>
  );
}

export default Navbar;