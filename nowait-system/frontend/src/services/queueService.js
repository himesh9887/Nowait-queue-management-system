import api from "./api";

function buildRequestConfig(token, extra = {}) {
  return {
    ...extra,
    headers: token
      ? {
          ...(extra.headers || {}),
          Authorization: `Bearer ${token}`,
        }
      : extra.headers || undefined,
  };
}

export async function bookToken(payload, token) {
  const { data } = await api.post("/book-token", payload, buildRequestConfig(token));
  return data;
}

export async function getQueueStatus(token, day = "today") {
  const { data } = await api.get(
    "/queue",
    buildRequestConfig(token, {
      params: { day },
    }),
  );
  return data;
}

export async function getBookings(token, day = "today") {
  const { data } = await api.get(
    "/bookings",
    buildRequestConfig(token, {
      params: { day },
    }),
  );
  return data;
}

export async function nextToken(token, day = "today") {
  const { data } = await api.post(
    "/next-token",
    { day },
    buildRequestConfig(token),
  );
  return data;
}

export async function skipToken(token, day = "today") {
  const { data } = await api.post(
    "/skip-token",
    { day },
    buildRequestConfig(token),
  );
  return data;
}

export async function resetQueue(token, day = "today") {
  const { data } = await api.post(
    "/reset-queue",
    { day },
    buildRequestConfig(token),
  );
  return data;
}
