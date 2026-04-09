import API from "../../api/axios";

export const createOrder = (data) => 
    API.post("/orders",data);

export const getMyOrders = () => 
    API.get("/orders/my_orders");

export const cancelOrder = (id) => 
    API.put(`/orders/${id}/cancel`);

