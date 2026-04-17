import api from "./axios";

export const detectUserRole = async () => {
  try {
    await api.get("/api/students/");
    return "SUPERVISOR";
  } catch (err) {
    if (err.response?.status === 403) {
      return "STUDENT";
    }
    throw err;
  }
};
