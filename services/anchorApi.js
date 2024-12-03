const axios = require("axios");

// Create Axios instance
const anchorAPI = axios.create({
  baseURL: "https://api.sandbox.getanchor.co/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach the API key dynamically
anchorAPI.interceptors.request.use(
  (config) => {
    const apiKey = process.env.ANCHOR_API_KEY; // Store API key in environment variables
    if (apiKey) {
      config.headers["x-anchor-key"] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = anchorAPI;
