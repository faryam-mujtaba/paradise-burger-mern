import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/navbar.css";

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
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(user);

  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  useEffect(() => {
    const handleProfileUpdated = (event) => {
      if (event.detail) {
        setProfileUser(event.detail);
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, []);

  const currentUser = profileUser || user;

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
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
    isActive
      ? "nav-icon-link active-nav-link"
      : "nav-icon-link";

  const firstName = currentUser?.fullName
    ?.trim()
    .split(" ")
    .filter(Boolean)[0];

  const displayName =
    firstName ||
    (currentUser?.role === "admin"
      ? "Admin"
      : currentUser?.role === "subadmin"
        ? "Sub Admin"
        : currentUser?.phone || "Profile");

  return (
    <>
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
          <NavLink to="/" onClick={closeMobileMenu}>
            <span className="logo-icon">🍔</span>
            <span className="logo-text">Paradise Burger</span>
          </NavLink>
        </motion.div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>

        <div
          className={`mobile-menu-overlay ${
            isMobileMenuOpen ? "show-mobile-overlay" : ""
          }`}
          onClick={closeMobileMenu}
        />

        <div
          className={`navbar-links ${
            isMobileMenuOpen ? "mobile-menu-open" : ""
          }`}
        >
          <button
            type="button"
            className="mobile-menu-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

          <motion.div {...navMotion}>
            <NavLink
              className={navClass}
              to="/"
              onClick={closeMobileMenu}
            >
              <FaHome />
              <span>Home</span>
            </NavLink>
          </motion.div>

          <motion.div {...navMotion}>
            <NavLink
              className={navClass}
              to="/menu"
              onClick={closeMobileMenu}
            >
              <FaUtensils />
              <span>Menu</span>
            </NavLink>
          </motion.div>

          {currentUser?.role === "customer" && (
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
                  onClick={closeMobileMenu}
                >
                  <FaShoppingCart />
                  <span>Cart</span>

                  {cartCount > 0 && (
                    <span className="cart-count-badge">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
              </motion.div>

              <motion.div {...navMotion}>
                <NavLink
                  className={navClass}
                  to="/my-orders"
                  onClick={closeMobileMenu}
                >
                  <FaClipboardList />
                  <span>Orders</span>
                </NavLink>
              </motion.div>
            </>
          )}

          {currentUser?.role === "admin" && (
            <>
              <motion.div {...navMotion}>
                <NavLink
                  className={navClass}
                  to="/admin/dashboard"
                  onClick={closeMobileMenu}
                >
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </NavLink>
              </motion.div>

              <motion.div {...navMotion}>
                <NavLink
                  className={navClass}
                  to="/admin/menu"
                  onClick={closeMobileMenu}
                >
                  <FaHamburger />
                  <span>Items</span>
                </NavLink>
              </motion.div>

              <motion.div {...navMotion}>
                <NavLink
                  className={navClass}
                  to="/admin/categories"
                  onClick={closeMobileMenu}
                >
                  <FaTags />
                  <span>Categories</span>
                </NavLink>
              </motion.div>

              <motion.div {...navMotion}>
                <NavLink
                  className={navClass}
                  to="/admin/deals"
                  onClick={closeMobileMenu}
                >
                  <FaFire />
                  <span>Deals</span>
                </NavLink>
              </motion.div>
            </>
          )}

          {currentUser?.role === "subadmin" && (
            <motion.div {...navMotion}>
              <NavLink
                className={navClass}
                to="/subadmin/orders"
                onClick={closeMobileMenu}
              >
                <FaClipboardList />
                <span>Orders Panel</span>
              </NavLink>
            </motion.div>
          )}

          {currentUser && (
            <motion.div {...navMotion}>
              <NavLink
                className={navClass}
                to="/change-password"
                onClick={closeMobileMenu}
              >
                <FaLock />
                <span>Password</span>
              </NavLink>
            </motion.div>
          )}

          {!currentUser && (
            <>
              <motion.div {...navMotion}>
                <NavLink
                  className={navClass}
                  to="/login"
                  onClick={closeMobileMenu}
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </NavLink>
              </motion.div>

              <motion.div {...navMotion}>
                <NavLink
                  className="nav-icon-link register-nav-link"
                  to="/register"
                  onClick={closeMobileMenu}
                >
                  <FaUserPlus />
                  <span>Register</span>
                </NavLink>
              </motion.div>
            </>
          )}

          {currentUser && (
            <>
              <motion.div {...navMotion}>
                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  title={`Open ${displayName} profile`}
                  style={{ textDecoration: "none" }}
                  className={({ isActive }) =>
                    `nav-user ${
                      currentUser.role === "admin"
                        ? "admin-user-badge"
                        : currentUser.role === "subadmin"
                          ? "subadmin-user-badge"
                          : "customer-user-badge"
                    } ${
                      isActive ? "active-profile-link" : ""
                    }`
                  }
                >
                  <FaUserCircle />
                  <span>{displayName}</span>
                </NavLink>
              </motion.div>

              <motion.button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                }}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.nav>
    </>
  );
}

export default Navbar;