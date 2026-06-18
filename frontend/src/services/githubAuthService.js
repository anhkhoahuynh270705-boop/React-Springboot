const API_URL = "http://localhost:8080/api/auth/github";

export const loginWithGithub = () => {
  window.location.href = API_URL;
};