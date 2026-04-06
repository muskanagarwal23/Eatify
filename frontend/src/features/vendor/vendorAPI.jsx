import API from "../../api/axios";

export const createVendorProfile = (data) => 
    API.post("/vendor/profile",data);

export const getVendorProfile = () => 
    API.get("/vendor/profile");

export const createMenu = (data) => 
    API.post("/menu",data);

export const updateMenuItem = (id,data) => 
    API.put(`/menu/${id}`,data);

export const getMenuItem = () => 
    API.get("/menu");

export const deleteMenuItem = (id) => 
    API.delete(`/menu/${id}`);

export const UpdateOrderStatus = (id,data) => 
    API.patch(`/orders/${id}/status`,data);

export const getVendorOrders = () => 
    API.get("/orders/vendor_orders");

export const toggleAvail = (id,data) => 
    API.patch(`/menu/${id}/toggle`,data);