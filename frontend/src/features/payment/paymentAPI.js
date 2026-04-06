import API from "../../api/axios";

export const createPaymentOrder = (orderId) =>
  API.post(`/payments/create-order/${orderId}`);