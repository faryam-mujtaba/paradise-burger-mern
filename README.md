# Paradise Burger MERN Stack Restaurant Ordering System

Paradise Burger is a full-stack restaurant ordering and delivery management system built with the MERN stack. The project allows customers to browse food items, add items to cart, place orders, track order status, and allows admin and riders to manage the full delivery workflow.

## Project Overview

This project is designed for a restaurant or fast-food business that wants to manage online food orders. It includes three main roles:

- Customer
- Admin
- Rider

Each role has its own dashboard and responsibilities.

## Main Features

### Customer Features

- Customer registration
- Customer login
- View restaurant menu
- Add food items to cart
- Cart saved in browser localStorage
- Checkout with delivery address
- Cash on Delivery order placement
- View order history
- Track order status updates

### Admin Features

- Admin login
- View all customer orders
- Accept pending orders
- Reject pending orders
- Mark order as preparing
- Mark order as ready
- View available riders
- Assign ready orders to riders

### Rider Features

- Rider login
- View rider profile
- Set availability status
- View assigned orders
- Mark order as picked up
- Mark order as out for delivery
- Mark order as delivered
- Mark order as failed delivery

## Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

### Database

- MongoDB Atlas

## Folder Structure

```text
paradise-burger-mern/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md