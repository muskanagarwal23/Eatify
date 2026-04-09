import API from "../../api/axios";

export const createReviews = (data) => 
    API.post("/reviews", data);

export const getPublicReviews = (id) => 
    API.get(`/reviews/${id}`);


export const getVendorReviews = () => 
    API.get("/reviews");

export const replyToReviews = (id,data) => 
    API.post(`/reviews/${id}/reply`,data);


