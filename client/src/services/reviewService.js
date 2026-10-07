import api from "./api";

const reviewService = {
  getListingReviews: async (listingId) => {
    const res = await api.get("/reviews/listing/" + listingId);
    return res.data;
  },
  createReview: async (listingId, data) => {
    const res = await api.post("/reviews/listing/" + listingId, data);
    return res.data;
  },
  markHelpful: async (reviewId) => {
    const res = await api.put("/reviews/" + reviewId + "/helpful");
    return res.data;
  },
  deleteReview: async (reviewId) => {
    const res = await api.delete("/reviews/" + reviewId);
    return res.data;
  },
};

export default reviewService;
