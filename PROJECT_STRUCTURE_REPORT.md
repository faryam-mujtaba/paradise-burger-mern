# Paradise Burger MERN Project Structure Report

This report summarizes the project layout, main frontend/backend entry points, route structure, styling files, dependencies, and feature areas.

---

## 1. Project Folder Structure

```text
paradise-burger-mern/
├── README.md
├── PROJECT_SUMMARY.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminOrderController.js
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── dealController.js
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── dealUpload.js
│   │   ├── roleMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── Deal.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Otp.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dealRoutes.js
│   │   ├── menuRoutes.js
│   │   └── orderRoutes.js
│   ├── seeders/
│   │   └── adminSeeder.js
│   ├── services/
│   ├── uploads/
│   │   ├── deals/
│   │   └── menu/
│   └── utils/
│       ├── createPasswordResetToken.js
│       ├── createVerificationToken.js
│       ├── generateToken.js
│       └── sendEmail.js
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── public/
│   │   └── images/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── animations/
│       │   │   ├── MotionButton.jsx
│       │   │   └── PageTransition.jsx
│       │   ├── ConfirmModal.jsx
│       │   ├── HotDeals.jsx
│       │   ├── Navbar.jsx
│       │   ├── OrderStatusWatcher.jsx
│       │   ├── PromptModal.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ScrollToTop.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── NotificationContext.jsx
│       ├── pages/
│       │   ├── AdminCategoryManagement.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminDealManagement.jsx
│       │   ├── AdminMenuManagement.jsx
│       │   ├── Cart.jsx
│       │   ├── ChangePassword.jsx
│       │   ├── Checkout.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Menu.jsx
│       │   ├── MyOrders.jsx
│       │   ├── OrderSuccess.jsx
│       │   ├── Register.jsx
│       │   ├── ResendVerification.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── SubAdminOrders.jsx
│       │   ├── VerifyEmail.jsx
│       ├── routes/
│       ├── services/
│       │   └── api.js
│       └── styles/
│           ├── admin.css
│           ├── confirmModal.css
│           ├── deals.css
│           ├── myOrders.css
│           ├── navbar.css
│           ├── notification.css
│           └── promptModal.css
```

---

## 2. Frontend Structure

### src/components
- Contains reusable UI building blocks such as the navbar, protected route wrapper, modal components, and page transition helpers.
- Key files:
  - [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx) — Main site navigation and mobile drawer UI.
  - [frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx) — Restricts routes by user role.
  - [frontend/src/components/ConfirmModal.jsx](frontend/src/components/ConfirmModal.jsx) — Reusable confirmation dialog.
  - [frontend/src/components/PromptModal.jsx](frontend/src/components/PromptModal.jsx) — Reusable prompt modal for text input.
  - [frontend/src/components/HotDeals.jsx](frontend/src/components/HotDeals.jsx) — Displays featured deals.
  - [frontend/src/components/OrderStatusWatcher.jsx](frontend/src/components/OrderStatusWatcher.jsx) — Monitors order status updates.
  - [frontend/src/components/ScrollToTop.jsx](frontend/src/components/ScrollToTop.jsx) — Scrolls the page to top on route change.

### src/pages
- Contains route-level page components for home, auth, cart, checkout, orders, and admin management.
- Key files:
  - [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx) — Landing page.
  - [frontend/src/pages/Menu.jsx](frontend/src/pages/Menu.jsx) — Menu browsing page.
  - [frontend/src/pages/Cart.jsx](frontend/src/pages/Cart.jsx) — Cart management page.
  - [frontend/src/pages/Checkout.jsx](frontend/src/pages/Checkout.jsx) — Checkout flow.
  - [frontend/src/pages/MyOrders.jsx](frontend/src/pages/MyOrders.jsx) — Customer order history.
  - [frontend/src/pages/AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx) — Admin order management dashboard.
  - [frontend/src/pages/AdminMenuManagement.jsx](frontend/src/pages/AdminMenuManagement.jsx) — Menu item CRUD UI.
  - [frontend/src/pages/AdminCategoryManagement.jsx](frontend/src/pages/AdminCategoryManagement.jsx) — Category CRUD UI.
  - [frontend/src/pages/AdminDealManagement.jsx](frontend/src/pages/AdminDealManagement.jsx) — Deal CRUD UI.
  - [frontend/src/pages/SubAdminOrders.jsx](frontend/src/pages/SubAdminOrders.jsx) — Subadmin order panel.

### src/context
- Holds global React state for authentication, cart, and notifications.
- Key files:
  - [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) — Stores auth state and user session.
  - [frontend/src/context/CartContext.jsx](frontend/src/context/CartContext.jsx) — Manages cart state.
  - [frontend/src/context/NotificationContext.jsx](frontend/src/context/NotificationContext.jsx) — Global toast-style notifications.

### src/services
- Contains shared API helpers.
- Key file:
  - [frontend/src/services/api.js](frontend/src/services/api.js) — Central Axios instance for frontend API calls.

### src/routes
- This folder is currently empty and appears reserved for future route-specific structure.

### src/styles
- Contains CSS modules/stylesheet files for pages and shared UI components.
- Key files:
  - [frontend/src/index.css](frontend/src/index.css) — Global site styling.
  - [frontend/src/styles/navbar.css](frontend/src/styles/navbar.css) — Navbar and mobile drawer styles.
  - [frontend/src/styles/notification.css](frontend/src/styles/notification.css) — Notification UI styling.
  - [frontend/src/styles/confirmModal.css](frontend/src/styles/confirmModal.css) — Confirm modal styling.
  - [frontend/src/styles/promptModal.css](frontend/src/styles/promptModal.css) — Prompt modal styling.
  - [frontend/src/styles/deals.css](frontend/src/styles/deals.css) — Deal management visuals.
  - [frontend/src/styles/myOrders.css](frontend/src/styles/myOrders.css) — Order history page styling.
  - [frontend/src/styles/admin.css](frontend/src/styles/admin.css) — Admin-related styling.

### App.jsx
- [frontend/src/App.jsx](frontend/src/App.jsx) — Main React router setup and route definitions.

### main.jsx
- [frontend/src/main.jsx](frontend/src/main.jsx) — Application bootstrap file.

### index.css
- [frontend/src/index.css](frontend/src/index.css) — Main global stylesheet for the app.

---

## 3. Backend Structure

### models
- MongoDB/Mongoose models for the application domain.
- Key files:
  - [backend/models/User.js](backend/models/User.js) — User account and role data.
  - [backend/models/MenuItem.js](backend/models/MenuItem.js) — Menu item schema.
  - [backend/models/Category.js](backend/models/Category.js) — Category schema.
  - [backend/models/Order.js](backend/models/Order.js) — Customer order schema.
  - [backend/models/Deal.js](backend/models/Deal.js) — Deal schema.
  - [backend/models/Otp.js](backend/models/Otp.js) — Verification/reset token storage.

### controllers
- Business logic handlers for auth, admin order management, categories, deals, menu, and orders.
- Key files:
  - [backend/controllers/authController.js](backend/controllers/authController.js) — Authentication logic.
  - [backend/controllers/adminOrderController.js](backend/controllers/adminOrderController.js) — Admin order actions.
  - [backend/controllers/categoryController.js](backend/controllers/categoryController.js) — Category CRUD logic.
  - [backend/controllers/menuController.js](backend/controllers/menuController.js) — Menu CRUD logic.
  - [backend/controllers/orderController.js](backend/controllers/orderController.js) — Order placement and updates.
  - [backend/controllers/dealController.js](backend/controllers/dealController.js) — Deal CRUD logic.

### routes
- Express route definitions grouped by feature.
- Key files:
  - [backend/routes/authRoutes.js](backend/routes/authRoutes.js) — Auth endpoints.
  - [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js) — Admin endpoints.
  - [backend/routes/categoryRoutes.js](backend/routes/categoryRoutes.js) — Category endpoints.
  - [backend/routes/menuRoutes.js](backend/routes/menuRoutes.js) — Menu endpoints.
  - [backend/routes/orderRoutes.js](backend/routes/orderRoutes.js) — Order endpoints.
  - [backend/routes/dealRoutes.js](backend/routes/dealRoutes.js) — Deal endpoints.

### middlewares
- Reusable Express middleware for auth, role checks, and uploads.
- Key files:
  - [backend/middlewares/authMiddleware.js](backend/middlewares/authMiddleware.js) — Auth token verification.
  - [backend/middlewares/roleMiddleware.js](backend/middlewares/roleMiddleware.js) — Role-based access checks.
  - [backend/middlewares/uploadMiddleware.js](backend/middlewares/uploadMiddleware.js) — General file upload handling.
  - [backend/middlewares/dealUpload.js](backend/middlewares/dealUpload.js) — Deal image upload handling.

### server.js
- [backend/server.js](backend/server.js) — Main backend startup file and API mounting point.

### upload folders
- [backend/uploads](backend/uploads) — Stores uploaded menu and deal images.
- Subfolders:
  - [backend/uploads/menu](backend/uploads/menu)
  - [backend/uploads/deals](backend/uploads/deals)

---

## 4. Frontend Routes Found in App.jsx

The app defines these frontend routes:

- `/` → Home
- `/menu` → Menu
- `/login` → Login
- `/register` → Register
- `/verify-email/:token` → Email verification
- `/resend-verification` → Resend verification
- `/forgot-password` → Forgot password
- `/reset-password/:token` → Reset password
- `/cart` → Protected customer cart page
- `/checkout` → Protected customer checkout page
- `/order-success` → Protected customer success page
- `/my-orders` → Protected customer order history
- `/admin/dashboard` → Protected admin dashboard
- `/admin/menu` → Protected admin menu management
- `/admin/categories` → Protected admin category management
- `/admin/deals` → Protected admin deals management
- `/change-password` → Protected route for customer/admin/subadmin
- `/subadmin/orders` → Protected subadmin orders page

---

## 5. Backend API Route Prefixes Found in server.js

- `/api/auth`
- `/api/admin`
- `/api/categories`
- `/api/menu`
- `/api/orders`
- `/api/deals`
- `/uploads` (static file serving)

---

## 6. CSS Files and Likely Styling Targets

- [frontend/src/index.css](frontend/src/index.css) — Global styles for the whole app, including pages, cards, forms, and layout.
- [frontend/src/styles/navbar.css](frontend/src/styles/navbar.css) — Navbar and mobile drawer UI.
- [frontend/src/styles/notification.css](frontend/src/styles/notification.css) — Notification popup/toast UI.
- [frontend/src/styles/confirmModal.css](frontend/src/styles/confirmModal.css) — Confirmation modal styling.
- [frontend/src/styles/promptModal.css](frontend/src/styles/promptModal.css) — Prompt modal styling.
- [frontend/src/styles/deals.css](frontend/src/styles/deals.css) — Deal management and deal cards.
- [frontend/src/styles/myOrders.css](frontend/src/styles/myOrders.css) — My orders page visuals.
- [frontend/src/styles/admin.css](frontend/src/styles/admin.css) — Admin dashboard and admin page styling.

---

## 7. Package Dependencies

### Frontend dependencies
- [frontend/package.json](frontend/package.json)
- Runtime:
  - axios
  - framer-motion
  - react
  - react-dom
  - react-hot-toast
  - react-icons
  - react-router-dom
- Development:
  - @eslint/js
  - @types/react
  - @types/react-dom
  - @vitejs/plugin-react
  - eslint
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh
  - globals
  - vite

### Backend dependencies
- [backend/package.json](backend/package.json)
- Runtime:
  - bcryptjs
  - cors
  - dotenv
  - express
  - jsonwebtoken
  - mongoose
  - multer
  - nodemailer
- Development:
  - nodemon

---

## 8. Environment Variables Found

Environment variables were found in [backend/.env](backend/.env). Only variable names are listed below:

- PORT=hidden
- MONGO_URI=hidden
- JWT_SECRET=hidden
- JWT_EXPIRES_IN=hidden
- EMAIL_SERVICE=hidden
- EMAIL_USER=hidden
- EMAIL_PASS=hidden
- EMAIL_FROM=hidden
- FRONTEND_URL=hidden

---

## 9. Current Feature Areas

### Authentication
- [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)
- [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx)
- [frontend/src/pages/ForgotPassword.jsx](frontend/src/pages/ForgotPassword.jsx)
- [frontend/src/pages/ResetPassword.jsx](frontend/src/pages/ResetPassword.jsx)
- [frontend/src/pages/VerifyEmail.jsx](frontend/src/pages/VerifyEmail.jsx)
- [frontend/src/pages/ResendVerification.jsx](frontend/src/pages/ResendVerification.jsx)
- [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- [backend/controllers/authController.js](backend/controllers/authController.js)
- [backend/routes/authRoutes.js](backend/routes/authRoutes.js)

### Cart
- [frontend/src/context/CartContext.jsx](frontend/src/context/CartContext.jsx)
- [frontend/src/pages/Cart.jsx](frontend/src/pages/Cart.jsx)

### Checkout
- [frontend/src/pages/Checkout.jsx](frontend/src/pages/Checkout.jsx)
- [backend/controllers/orderController.js](backend/controllers/orderController.js)
- [backend/routes/orderRoutes.js](backend/routes/orderRoutes.js)

### Orders
- [frontend/src/pages/MyOrders.jsx](frontend/src/pages/MyOrders.jsx)
- [frontend/src/pages/OrderSuccess.jsx](frontend/src/pages/OrderSuccess.jsx)
- [backend/models/Order.js](backend/models/Order.js)
- [backend/controllers/orderController.js](backend/controllers/orderController.js)

### Admin Dashboard
- [frontend/src/pages/AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx)
- [backend/controllers/adminOrderController.js](backend/controllers/adminOrderController.js)
- [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js)

### Subadmin Orders
- [frontend/src/pages/SubAdminOrders.jsx](frontend/src/pages/SubAdminOrders.jsx)
- [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js)

### Menu Management
- [frontend/src/pages/AdminMenuManagement.jsx](frontend/src/pages/AdminMenuManagement.jsx)
- [backend/controllers/menuController.js](backend/controllers/menuController.js)
- [backend/routes/menuRoutes.js](backend/routes/menuRoutes.js)
- [backend/models/MenuItem.js](backend/models/MenuItem.js)

### Category Management
- [frontend/src/pages/AdminCategoryManagement.jsx](frontend/src/pages/AdminCategoryManagement.jsx)
- [backend/controllers/categoryController.js](backend/controllers/categoryController.js)
- [backend/routes/categoryRoutes.js](backend/routes/categoryRoutes.js)
- [backend/models/Category.js](backend/models/Category.js)

### Deals
- [frontend/src/pages/AdminDealManagement.jsx](frontend/src/pages/AdminDealManagement.jsx)
- [frontend/src/components/HotDeals.jsx](frontend/src/components/HotDeals.jsx)
- [backend/controllers/dealController.js](backend/controllers/dealController.js)
- [backend/routes/dealRoutes.js](backend/routes/dealRoutes.js)
- [backend/models/Deal.js](backend/models/Deal.js)

### Notifications
- [frontend/src/context/NotificationContext.jsx](frontend/src/context/NotificationContext.jsx)
- [frontend/src/styles/notification.css](frontend/src/styles/notification.css)

### Navbar / Mobile Drawer
- [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx)
- [frontend/src/styles/navbar.css](frontend/src/styles/navbar.css)
