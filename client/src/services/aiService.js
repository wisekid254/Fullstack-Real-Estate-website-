import api from "./api";

const aiService = {
  valuateListing: async (listingId) => {
    const res = await api.get(`/ai/valuate/${listingId}`);
    return res.data;
  },
  naturalLanguageSearch: async (query) => {
    const res = await api.post("/ai/search", { query });
    return res.data;
  },
  chat: async (message, history = [], listingId = null, pageContext = "") => {
    const res = await api.post("/ai/chat", {
      message,
      history,
      listingId,
      pageContext,
    });
    return res.data;
  },
  generateDescription: async (listingData) => {
    const res = await api.post("/ai/generate-description", listingData);
    return res.data;
  },
};

export default aiService;
