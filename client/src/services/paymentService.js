import api from "./api";

const paymentService = {
  getPlans: async () => {
    const res = await api.get("/payments/plans");
    return res.data;
  },
  initiatePayment: async (data) => {
    const res = await api.post("/payments/initiate", data);
    return res.data;
  },
  confirmPayment: async (data) => {
    const res = await api.post("/payments/confirm", data);
    return res.data;
  },
  getMyPayments: async () => {
    const res = await api.get("/payments/my-payments");
    return res.data;
  },
  getListingPayments: async (listingId) => {
    const res = await api.get("/payments/listing/" + listingId);
    return res.data;
  },
  getAllPayments: async (page = 1) => {
    const res = await api.get("/payments/all?page=" + page);
    return res.data;
  },
};

export default paymentService;
