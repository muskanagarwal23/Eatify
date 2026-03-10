# Project Structure ( Frontend)
- Create the React Project
```
npm create vite@latest frontend
```

- Install Required Dependencies
```
npm install react-router-dom
npm install axios
npm install @reduxjs/toolkit react-redux
npm install socket.io-client
npm install react-hot-toast
npm install react-icons
```

- Install Tailwind CSS
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- Folder Structure
```
src
│
├── api
│   ├── axios.js
│   └── endpoints.js
│
├── app
│   └── store.js
│
├── features
│   ├── auth
│   │   ├── authSlice.js
│   │   └── authAPI.js
│   │
│   ├── cart
│   │   ├── cartSlice.js
│   │   └── cartAPI.js
│   │
│   ├── orders
│   │   ├── orderSlice.js
│   │   └── orderAPI.js
│   │
│   ├── menu
│   │   ├── menuSlice.js
│   │   └── menuAPI.js
│
├── pages
│
│   ├── auth
│   │   ├── Login.jsx
│   │   └── Register.jsx
│
│   ├── customer
│   │   ├── Home.jsx
│   │   ├── Restaurant.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── OrderTracking.jsx
│
│   ├── vendor
│   │   ├── VendorDashboard.jsx
│   │   ├── MenuManager.jsx
│   │   └── Orders.jsx
│
│   ├── delivery
│   │   ├── DeliveryDashboard.jsx
│   │   └── AssignedOrders.jsx
│
│   └── admin
│       ├── AdminDashboard.jsx
│       ├── Vendors.jsx
│       └── DeliveryPartners.jsx
│
├── components
│
│   ├── ui
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   │
│   ├── layout
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│
│   ├── restaurant
│   │   └── RestaurantCard.jsx
│
│   └── order
│       └── OrderTimeline.jsx
│
├── hooks
│   └── useAuth.js
│
├── sockets
│   └── socket.js
│
├── routes
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── utils
│   └── formatPrice.js
│
├── App.jsx
├── main.jsx
└── index.css
```