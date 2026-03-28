import api from "./api";

const uploadService = {
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteImage: async (publicId) => {
    const res = await api.delete(`/upload/${publicId}`);
    return res.data;
  },
};

export default uploadService;
