import { api } from "./axios";

export const getIncomes = async () => {
  const response = await api.get("/get-incomes");
  return response.data;
};

export const getExpenses = async () => {
  const response = await api.get("/get-expenses");
  return response.data;
};

export const getAccounts = async () => {
  const response = await api.get("/get-accounts");
  return response.data;
};
export const createIncome = async (data) => {
  const response = await api.post("/add-income", data);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post("/add-expense", data);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/get-categories");
  return response.data;
};
export const createCategory = async (data) => {
  const response = await api.post("/add-category", data);
  return response.data;
};
export const createAccount = async (data) => {
  const response = await api.post("/add-account", data);
  return response.data;
};
export const deleteExpense = async (id) => {
  const response = await api.delete(`/delete-expense/${id}`);
  return response.data;
};

export const deleteIncome = async (id) => {
  const response = await api.delete(`/delete-income/${id}`);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/update-expense/${id}`, data);
  return response.data;
};

export const updateIncome = async (id, data) => {
  const response = await api.put(`/update-income/${id}`, data);
  return response.data;
};
export const getBudgets = async () => {
  const response = await api.get("/get-budgets");
  return response.data;
};

export const createBudget = async (data) => {
  const response = await api.post("/add-budget", data);
  return response.data;
};
export const getSavings = async () => {
  const response = await api.get("/get-savings");
  return response.data;
};

export const createSaving = async (data) => {
  const response = await api.post("/add-saving", data);
  return response.data;
};
export const getUserById = async (usuarioId = "U001") => {
  const response = await api.get(`/get-user/${usuarioId}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/update-user/${id}`, data);
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

export const updateCategory = async (id, data) => {
  const response = await api.put(`/update-category/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/delete-category/${id}`);
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