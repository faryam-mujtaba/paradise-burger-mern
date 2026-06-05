# Paradise Burger MERN Project Summary

## 1. Project Purpose

Paradise Burger is a food delivery web application built in MERN-style architecture. It provides:
- Customer ordering experience for browsing menu items, adding to cart, checkout, and order tracking.
- Admin management for menu items, order processing, and rider assignment.
- Rider workflows to accept delivery assignments and update delivery status.

## 2. Folder Structure

Root:
- `README.md`

Backend:
- `backend/package.json`
- `backend/server.js`
- `backend/config/db.js`
- `backend/routes/`
  - `authRoutes.js`
  - `adminRoutes.js`
  - `categoryRoutes.js`
  - `menuRoutes.js`
  - `orderRoutes.js`
  - `riderRoutes.js`
- `backend/controllers/`
  - `authController.js`
  - `categoryController.js`
  - `menuController.js`
  - `orderController.js`
  - `adminOrderController.js`
  - `riderController.js`
- `backend/middlewares/`
  - `authMiddleware.js`
  - `roleMiddleware.js`
  - `uploadMiddleware.js`
- `backend/models/`
  - `User.js`
  - `Order.js`
  - `MenuItem.js`
  - `Category.js`
  - `RiderProfile.js`
  - `Otp.js`
- `backend/utils/generateToken.js`
- `backend/uploads/menu/` (image storage)

Frontend:
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/services/api.js`
- `frontend/src/context/`
  - `AuthContext.jsx`
  - `CartContext.jsx`
- `frontend/src/components/`
  - `Navbar.jsx`
- `frontend/src/pages/`
  - `Home.jsx`
  - `Menu.jsx`
  - `Login.jsx`
  - `Register.jsx`
  - `Cart.jsx`
  - `Checkout.jsx`
  - `OrderSuccess.jsx`
  - `MyOrders.jsx`
  - `AdminDashboard.jsx`
  - `AdminMenuManagement.jsx`
  - `RiderDashboard.jsx`

## 3. Backend Modules

### Auth Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Menu Routes
- `GET /api/menu`
- `GET /api/menu/:id`
- `POST /api/menu` (admin only)
- `PUT /api/menu/:id` (admin only)
- `DELETE /api/menu/:id` (admin only)

### Category Routes
- `GET /api/categories`
- `POST /api/categories` (admin only)
- `PUT /api/categories/:id` (admin only)
- `DELETE /api/categories/:id` (admin only)

### Order Routes
- `POST /api/orders` (customer only)
- `GET /api/orders/my-orders` (customer only)
- `GET /api/orders/:id`
- `PUT /api/orders/:id/cancel` (customer only)

### Admin Routes
- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/accept`
- `PUT /api/admin/orders/:id/reject`
- `PUT /api/admin/orders/:id/status`
- `PUT /api/admin/orders/:id/assign-rider`
- `POST /api/admin/riders`
- `GET /api/admin/riders`
- `PUT /api/admin/riders/:id/deactivate`
- `PUT /api/admin/riders/:id/activate`

### Rider Routes
- `GET /api/rider/profile`
- `PUT /api/rider/availability`
- `GET /api/rider/orders`
- `PUT /api/rider/orders/:id/pickup`
- `PUT /api/rider/orders/:id/out-for-delivery`
- `PUT /api/rider/orders/:id/delivered`
- `PUT /api/rider/orders/:id/failed`

### Backend Models
- `User`: roles `customer`, `admin`, `rider`; stores auth and address info.
- `MenuItem`: item details, price, category reference, imageUrl, availability, soft delete.
- `Category`: active categories and slug.
- `Order`: customer, items, delivery address, payment info, order status, assigned rider, status history.
- `RiderProfile`: rider user link, bike data, availability, stats, active status.
- `Otp`: OTP storage schema exists but is not currently used.

### Middleware & Utilities
- `authMiddleware`: JWT token verification.
- `roleMiddleware`: role-based authorization.
- `uploadMiddleware`: multer file uploads for menu images.
- `generateToken.js`: JWT creation.
- `db.js`: MongoDB connection using `process.env.MONGO_URI`.

## 4. Frontend Modules

### App & Routing
- `src/main.jsx`: wraps app with `AuthProvider` and `CartProvider`.
- `src/App.jsx`: defines app routes with React Router.

### API Client
- `src/services/api.js`: axios with `baseURL` set to `http://localhost:5000/api`.

### Context Providers
- `src/context/AuthContext.jsx`:
  - stores auth state in localStorage.
  - provides `login` and `logout`.
- `src/context/CartContext.jsx`:
  - stores cart state in localStorage.
  - supports add, increase, decrease, remove, clear.
  - computes subtotal, delivery fee, total amount.

### UI Components
- `Navbar.jsx`: navigation links by role and cart count.

### Pages
- `Home.jsx`: landing page and marketing sections.
- `Menu.jsx`: menu display, add to cart, load menu data from backend.
- `Cart.jsx`: cart management and checkout button.
- `Checkout.jsx`: customer checkout form and order placement.
- `OrderSuccess.jsx`: confirmation page after order placement.
- `MyOrders.jsx`: customer order listing and status history.
- `Login.jsx`: login form and redirect based on role.
- `Register.jsx`: registration form for customers.
- `AdminDashboard.jsx`: admin order workflow and rider assignment.
- `AdminMenuManagement.jsx`: admin menu CRUD with image upload.
- `RiderDashboard.jsx`: rider availability and assigned order updates.

## 5. Existing Features

### Customer
- Register and login.
- Browse menu items and add to cart.
- Checkout with delivery address.
- View order status and history.
- Cancel pending orders.

### Admin
- View dashboard and orders.
- Accept or reject orders.
- Update order statuses through the kitchen workflow.
- Assign ready orders to available riders.
- Manage menu items with create, edit, and delete.

### Rider
- View rider profile.
- Set availability on/off.
- View assigned orders.
- Update assigned order status to pickup, out for delivery, delivered, or failed.

### General
- JWT-based authentication.
- Role-based route protection.
- Menu image upload support.
- Order status history tracking.

## 6. Missing or Incomplete Features

- No frontend UI for admin rider creation or rider activation/deactivation.
- No category management UI in frontend.
- No customer profile page or saved address management.
- No admin order detail page beyond the dashboard cards.
- No search or filter for menu items.
- No payment gateway integration; only Cash on Delivery.
- `Otp` model exists but is unused.
- No token refresh or automatic expiration handling.
- No multi-role registration flow for admin/rider via the app.
- Backend image cleanup on menu item delete is not implemented.
- No notification or real-time update system.

## 7. Bugs or Risks

- `CartContext` stores `item.image` but backend uses `imageUrl`, which may cause inconsistent image display.
- `Cart.jsx` uses `window.location.href` to navigate to checkout instead of React Router navigation.
- Stale JWT tokens remain in localStorage without automatic expiration management.
- No centralized error handling or UI feedback for API failures.
- Concurrent rider assignment and availability may lead to race conditions.
- `Otp` model indicates incomplete authentication features.
- Admin and rider routes rely on frontend role checks, but only backend authorization fully secures the API.

## 8. Next Recommended Steps

1. Add admin rider management UI:
   - create/activate/deactivate riders
   - show rider availability and stats

2. Add category management UI:
   - create/update/delete categories
   - link categories clearly to menu items

3. Improve auth/session handling:
   - refresh tokens or auto-logout on expiry
   - guard private routes centrally in frontend

4. Enhance workflow:
   - add order detail pages
   - show cancellation feedback
   - implement rider/customer notifications

5. Improve UX and consistency:
   - use React Router navigation everywhere
   - standardize image fields
   - validate forms more thoroughly

6. Finish or remove OTP feature:
   - either implement phone verification or remove unused `Otp` logic.

7. Harden backend:
   - add validation and rate limiting
   - clean up uploaded images when menu items are removed

## File Location

The summary file has been created in the project root as `PROJECT_SUMMARY.md`.
