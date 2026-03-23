import API from "../../api/axios";

export const addToCartAPI = (data) => API.post("/cart/add", data);
export const getCartAPI = () => API.get("/cart");