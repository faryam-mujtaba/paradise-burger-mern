import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import {
  FaHome,
  FaUtensils,
  FaShoppingCart,
  FaClipboardList,
  FaTachometerAlt,
  FaHamburger,
  FaTags,
  FaFire,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navMotion = {
    whileHover: {
      y: -2,
      scale: 1.04,
    },
    whileTap: {
      scale: 0.94,
    },
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 18,
    },
  };

  const navClass = ({ isActive }) =>
    isActive ? "nav-icon-link active-nav-link" : "nav-icon-link";

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="navbar-logo"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <NavLink to="/">
          <span className="logo-icon">🍔</span>
          <span className="logo-text">Paradise Burger</span>
        </NavLink>
      </motion.div>

      <div className="navbar-links">
        <motion.div {...navMotion}>
          <NavLink className={navClass} to="/">
            <FaHome />
            <span>Home</span>
          </NavLink>
        </motion.div>

        <motion.div {...navMotion}>
          <NavLink className={navClass} to="/menu">
            <FaUtensils />
            <span>Menu</span>
          </NavLink>
        </motion.div>

        {user?.role === "customer" && (
          <>
            <motion.div {...navMotion}>
              <NavLink
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "nav-icon-link active-nav-link"
                      : "nav-icon-link"
                  } cart-nav-link`
                }
                to="/cart"
              >
                <FaShoppingCart />
                <span>Cart</span>

                {cartCount > 0 && (
                  <span className="cart-count-badge">{cartCount}</span>
                )}
              </NavLink>
            </motion.div>

            <motion.div {...navMotion}>
              <NavLink className={navClass} to="/my-orders">
                <FaClipboardList />
                <span>Orders</span>
              </NavLink>
            </motion.div>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <motion.div {...navMotion}>
              <NavLink className={navClass} to="/admin/dashboard">
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </motion.div>

            <motion.div {...navMotion}>
              <NavLink className={navClass} to="/admin/menu">
                <FaHamburger />
                <span>Items</span>
              </NavLink>
            </motion.div>

            <motion.div {...navMotion}>
              <NavLink className={navClass} to="/admin/categories">
                <FaTags />
                <span>Categories</span>
              </NavLink>
            </motion.div>

            <motion.div {...navMotion}>
              <NavLink className={navClass} to="/admin/deals">
                <FaFire />
                <span>Deals</span>
              </NavLink>
            </motion.div>
          </>
        )}

        {user && (
          <motion.div {...navMotion}>
            <NavLink className={navClass} to="/change-password">
              <FaLock />
              <span>Password</span>
            </NavLink>
          </motion.div>
        )}

        {!user && (
          <>
            <motion.div {...navMotion}>
              <NavLink className={navClass} to="/login">
                <FaSignInAlt />
                <span>Login</span>
              </NavLink>
            </motion.div>

            <motion.div {...navMotion}>
              <NavLink className="nav-icon-link register-nav-link" to="/register">
                <FaUserPlus />
                <span>Register</span>
              </NavLink>
            </motion.div>
          </>
        )}

        {user && (
          <>
            <motion.div
              className={`nav-user ${
                user.role === "admin"
                  ? "admin-user-badge"
                  : "customer-user-badge"
              }`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 260 }}
              title={user.fullName || user.name || user.phone}
            >
              <FaUserCircle />
              <span>
                {user.role === "admin"
                  ? "Admin"
                  : user.fullName || user.name || user.phone}
              </span>
            </motion.div>

            <motion.button
              className="logout-btn"
              onClick={handleLogout}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 320 }}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </motion.button>
          </>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;