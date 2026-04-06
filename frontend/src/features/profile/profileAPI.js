import API from "../../api/axios";

export const getProfile = () => 
    API.get("/profile/user");

export const updateProfile = (data) => 
    API.put("/profile/user", data);