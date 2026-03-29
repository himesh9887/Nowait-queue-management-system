import api from "./api";

function withAdminToken(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function loginAdmin(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function getCurrentAdmin(token) {
  const { data } = await api.get("/auth/me", withAdminToken(token));
  return data;
}
