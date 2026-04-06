import API from "../../api/axios";

export const createOrder = () => API.post("/orders");

export const getMyOrders = () => 
    API.get("/orders/my_orders");

export const cancelOrder = (id) => 
    API.put(`/orders/${id}/cancel`);

export const submitRatings = (id,data) => 
    API.put(`/orders/${id}/rate`,data);