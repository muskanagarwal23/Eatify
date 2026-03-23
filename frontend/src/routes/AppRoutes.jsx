import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/customer/Home";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import Restaurant from "../pages/customer/Restaurant";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
        < Route 
        path="/"
        element={
            <Layout>
                <Home/>
            </Layout>
        }
        />

        <Route
        path="/cart"
        element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Layout>
                <Cart/>
            </Layout>
            </ProtectedRoute>
        }
        />

        <Route
        path="/checkout"
        element={
            <Layout>
                <Checkout/>
            </Layout>
        }
        />
        
        <Route
        path="restaurant/:id"
        element={
            <Layout>
                <Restaurant/>
            </Layout>
        }
        />
      
     </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
