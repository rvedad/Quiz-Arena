import { getUser } from "./user.js";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  const user = getUser();
  if (user) {
    headers["x-user-id"] = String(user.id);
    headers["x-is-admin"] = String(user.is_admin);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}
