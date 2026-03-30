import api from "./api";

function withAuthToken(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function register(payload) {
  const { data } = await api.post("/register", payload);
  return data;
}

export async function login(credentials) {
  const { data } = await api.post("/login", credentials);
  return data;
}

export async function getCurrentUser(token) {
  const { data } = await api.get("/me", withAuthToken(token));
  return data;
}
