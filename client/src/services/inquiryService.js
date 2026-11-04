import api from "./api";

const inquiryService = {
  create: async (data) => {
    const res = await api.post("/inquiries", data);
    return res.data;
  },
  getMine: async () => {
    const res = await api.get("/inquiries/mine");
    return res.data;
  },
};

export default inquiryService;
