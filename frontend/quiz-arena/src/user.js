export function getUser() {
  try {
    const stored = localStorage.getItem("quizarena_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem("quizarena_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("quizarena_user");
}
