import axios from "axios";
import { AUTH_SESSION_EXPIRED_EVENT } from "../utils/authSession";

function hasAuthorizationHeader(headers) {
  if (!headers) {
    return false;
  }

  if (typeof headers.get === "function") {
    return Boolean(headers.get("Authorization"));
  }

  return Boolean(headers.Authorization || headers.authorization);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong while talking to the server.";

    if (
      typeof window !== "undefined" &&
      statusCode === 401 &&
      hasAuthorizationHeader(error.config?.headers)
    ) {
      window.dispatchEvent(
        new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
          detail: {
            message,
          },
        }),
      );
    }

    const normalizedError = new Error(message);
    normalizedError.statusCode = statusCode;

    return Promise.reject(normalizedError);
  },
);

export default api;
