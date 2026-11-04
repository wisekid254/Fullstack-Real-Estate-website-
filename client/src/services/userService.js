import api from "./api";

const userService = {
  getProfile: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put("/users/me", data);
    return res.data;
  },
  saveListing: async (listingId) => {
    const res = await api.post(`/users/save/${listingId}`);
    return res.data;
  },
  getSavedListings: async () => {
    const res = await api.get("/users/saved");
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.put("/users/change-password", data);
    return res.data;
  },
};

export default userService;
