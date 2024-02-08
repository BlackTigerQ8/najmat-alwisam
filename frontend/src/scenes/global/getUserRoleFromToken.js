export const getUserRoleFromToken = () => {
  const token = localStorage.getItem("token");

  if (!token) return undefined;

  const decodedToken = atob(token.split(".")[1]);

  return JSON.parse(decodedToken).role;
};
