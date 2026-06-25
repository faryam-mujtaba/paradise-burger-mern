import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";

import AdminDashboard from "./pages/AdminDashboard";
import AdminMenuManagement from "./pages/AdminMenuManagement";
import AdminRiderManagement from "./pages/AdminRiderManagement";
import AdminCategoryManagement from "./pages/AdminCategoryManagement";

import RiderDashboard from "./pages/RiderDashboard";
import ChangePassword from "./pages/ChangePassword";
import VerifyEmail from "./pages/VerifyEmail";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-success"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminMenuManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/riders"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRiderManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCategoryManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rider/dashboard"
            element={
              <ProtectedRoute allowedRoles={["rider"]}>
                <RiderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/change-password"
  element={
    <ProtectedRoute allowedRoles={["customer", "admin", "rider"]}>
      <ChangePassword />
    </ProtectedRoute>
  }
/>
<Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;