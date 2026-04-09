import API from "../../api/axios";

export const getAssignedOrders = () => 
    API.get("/delivery/orders");

export const updateStatus = (id, data) =>
    API.patch(`/delivery/orders/${id}/status`, data);