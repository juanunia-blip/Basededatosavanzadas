import { api } from "./axios";

/* =========================
   AUTH
========================= */

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateMe = async (data) => {
  const response = await api.put("/auth/me", data);
  return response.data;
};
/* =========================
   INCOMES
========================= */

export const getIncomes = async () => {
  const response = await api.get("/get-incomes");
  return response.data;
};

export const createIncome = async (data) => {
  const response = await api.post("/add-income", data);
  return response.data;
};

export const updateIncome = async (id, data) => {
  const response = await api.put(`/update-income/${id}`, data);
  return response.data;
};

export const deleteIncome = async (id) => {
  const response = await api.delete(`/delete-income/${id}`);
  return response.data;
};

/* =========================
   EXPENSES
========================= */

export const getExpenses = async () => {
  const response = await api.get("/get-expenses");
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post("/add-expense", data);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/update-expense/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/delete-expense/${id}`);
  return response.data;
};

/* =========================
   ACCOUNTS
========================= */

export const getAccounts = async () => {
  const response = await api.get("/get-accounts");
  return response.data;
};

export const createAccount = async (data) => {
  const response = await api.post("/add-account", data);
  return response.data;
};

export const updateAccount = async (id, data) => {
  const response = await api.put(`/update-account/${id}`, data);
  return response.data;
};

export const deleteAccount = async (id) => {
  const response = await api.delete(`/delete-account/${id}`);
  return response.data;
};

/* =========================
   CATEGORIES
========================= */

export const getCategories = async () => {
  const response = await api.get("/get-categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/add-category", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/update-category/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/delete-category/${id}`);
  return response.data;
};

/* =========================
   BUDGETS
========================= */

export const getBudgets = async () => {
  const response = await api.get("/get-budgets");
  return response.data;
};

export const createBudget = async (data) => {
  const response = await api.post("/add-budget", data);
  return response.data;
};

export const updateBudget = async (id, data) => {
  const response = await api.put(`/update-budget/${id}`, data);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/delete-budget/${id}`);
  return response.data;
};

/* =========================
   SAVINGS
========================= */

export const getSavings = async () => {
  const response = await api.get("/get-savings");
  return response.data;
};

export const createSaving = async (data) => {
  const response = await api.post("/add-saving", data);
  return response.data;
};

export const updateSaving = async (id, data) => {
  const response = await api.put(`/update-saving/${id}`, data);
  return response.data;
};

export const deleteSaving = async (id) => {
  const response = await api.delete(`/delete-saving/${id}`);
  return response.data;
};

/* =========================
   USER
========================= */

export const getUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/update-user/${id}`, data);
  return response.data;
};

/* =========================
   AI
========================= */

export const askAI = async (data) => {
  const response = await api.post("/ai/ask", data);
  return response.data;
};

export const getAIInsights = async () => {
  const response = await api.get("/ai/insights");
  return response.data;
};

