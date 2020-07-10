export function getRequestUser(req) {
  const userId = req.headers["x-user-id"];
  const isAdmin = req.headers["x-is-admin"] === "true";
  return userId ? { id: Number(userId), is_admin: isAdmin } : null;
}
