import api from "./api";

const listingService = {
  getListings: async (params = {}) => {
    const res = await api.get("/listings", { params });
    return res.data;
  },
  getListing: async (id) => {
    const res = await api.get(`/listings/${id}`);
    return res.data;
  },
  getFeatured: async () => {
    const res = await api.get("/listings/featured");
    return res.data;
  },
  createListing: async (data) => {
    const res = await api.post("/listings", data);
    return res.data;
  },
  updateListing: async (id, data) => {
    const res = await api.put(`/listings/${id}`, data);
    return res.data;
  },
  deleteListing: async (id) => {
    const res = await api.delete(`/listings/${id}`);
    return res.data;
  },
};

export default listingService;
