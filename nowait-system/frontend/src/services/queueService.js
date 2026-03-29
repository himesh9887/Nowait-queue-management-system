import api from "./api";

function withAdminToken(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function bookToken(payload) {
  const { data } = await api.post("/book-token", payload);
  return data;
}

export async function getQueueStatus(tokenId) {
  const { data } = await api.get("/queue-status", {
    params: tokenId ? { tokenId } : undefined,
  });
  return data;
}

export async function getBookings(token) {
  const { data } = await api.get("/bookings", withAdminToken(token));
  return data;
}

export async function nextToken(token) {
  const { data } = await api.post("/next-token", {}, withAdminToken(token));
  return data;
}

export async function skipToken(token) {
  const { data } = await api.post("/skip-token", {}, withAdminToken(token));
  return data;
}

export async function resetQueue(token) {
  const { data } = await api.post("/reset", {}, withAdminToken(token));
  return data;
}
