import api from "./api";

const adminService = {
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  getAllListings: (params) =>
    api.get("/admin/listings", { params }).then((r) => r.data),
  updateListing: (id, data) =>
    api.put(`/admin/listings/${id}`, data).then((r) => r.data),
  deleteListing: (id) =>
    api.delete(`/admin/listings/${id}`).then((r) => r.data),
  getAllUsers: (params) =>
    api.get("/admin/users", { params }).then((r) => r.data),
  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}`, { role }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  getAllInquiries: (params) =>
    api.get("/admin/inquiries", { params }).then((r) => r.data),
  markInquiryRead: (id) =>
    api.put(`/admin/inquiries/${id}/read`).then((r) => r.data),
};

export default adminService;
