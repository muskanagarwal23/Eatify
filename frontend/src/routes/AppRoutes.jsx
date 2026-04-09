import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "../components/layout/Layout";
import Home from "../pages/customer/Home";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import Restaurant from "../pages/customer/Restaurant";
import OrderTracking from "../pages/customer/OrderTracking";
import Profile from "../pages/profile/Profile";
import Orders from "../pages/customer/Orders";
import OrderDetails from "../pages/customer/OrderDetails";
import Browse from "../pages/customer/Browse";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import VendorMenu from "../pages/vendor/VendorMenu";
import VendorOrders from "../pages/vendor/VendorOrders";
import VendorProfile from "../pages/profile/VendorProfile";
import VendorReview from "../pages/vendor/VendorReview";
import RestaurantReviews from "../pages/customer/RestaurantReviews";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import DeliveryOrders from "../pages/delivery/DeliveryOrders";
import DeliveryEarnings from "../pages/delivery/DeliveryEarnings";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Layout>
                <Cart />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Layout>
              <Checkout />
            </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/:id"
          element={
            <Layout>
              <Restaurant />
            </Layout>
          }
        />

        <Route
          path="/track"
          element={
            <Layout>
              <OrderTracking />
            </Layout>
          }
        />

        <Route path="/profile" 
        element={<Profile />} />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/reviews/:id"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Layout>
                <RestaurantReviews />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <Layout>
              <OrderDetails />
            </Layout>
          }
        />

        <Route
          path="/browse"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Layout>
                <Browse />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["VENDOR"]}>
                <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/menu"
          element={
            <ProtectedRoute allowedRoles={["VENDOR"]}>
                <VendorMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <ProtectedRoute allowedRoles={["VENDOR"]}>
                <VendorOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/profile"
          element={
            <ProtectedRoute allowedRoles={["VENDOR"]}>
                <VendorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/reviews"
          element={
            <ProtectedRoute allowedRoles={["VENDOR"]}>
                <VendorReview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute allowedRoles={["DELIVERY"]}>
                <DeliveryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/orders"
          element={
            <ProtectedRoute allowedRoles={["DELIVERY"]}>
                <DeliveryOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/earnings"
          element={
            <ProtectedRoute allowedRoles={["DELIVERY"]}>
                <DeliveryEarnings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
