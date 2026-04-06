import API from "../../api/axios";

export const addToCartAPI = (data) => 
    API.post("/cart/add", data);
export const getCartAPI = () => 
    API.get("/cart");
export const removeFromCartAPI = (itemId)=>
    API.delete(`/cart/${itemId}`);
export const updateCartAPI = (data) => 
    API.patch("/cart/update",data);