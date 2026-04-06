import API from "../../api/axios";

export const getRestaurants = () => API.get("/public/restaurants");
export const getMenu = (vendorId) => API.get(`/public/menu/${vendorId}`);
export const getRestaurantById = (id) =>
  API.get(`/public/restaurants/${id}`);