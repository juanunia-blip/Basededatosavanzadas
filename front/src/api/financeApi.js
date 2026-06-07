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

export const addSavingContribution = async (id, monto) => {
  const response = await api.patch(`/add-saving-contribution/${id}`, {
    monto,
  });

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

/* =========================
   BUSINESSES
========================= */

export const getBusinesses = async () => {
  const response = await api.get("/businesses");
  return response.data;
};

export const createBusiness = async (data) => {
  const response = await api.post("/businesses", data);
  return response.data;
};

export const getBusinessById = async (id) => {
  const response = await api.get(`/businesses/${id}`);
  return response.data;
};

export const updateBusiness = async (id, data) => {
  const response = await api.put(`/businesses/${id}`, data);
  return response.data;
};

export const deleteBusiness = async (id) => {
  const response = await api.delete(`/businesses/${id}`);
  return response.data;
};

export const getBusinessSummary = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/summary`);
  return response.data;
};

export const getBusinessWorkers = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/workers`);
  return response.data;
};

export const createBusinessWorker = async (businessId, data) => {
  const response = await api.post(`/businesses/${businessId}/workers`, data);
  return response.data;
};

export const getBusinessProductions = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/productions`);
  return response.data;
};

export const createBusinessProduction = async (businessId, data) => {
  const response = await api.post(
    `/businesses/${businessId}/productions`,
    data
  );
  return response.data;
};

export const getBusinessExpenses = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/expenses`);
  return response.data;
};

export const createBusinessExpense = async (businessId, data) => {
  const response = await api.post(`/businesses/${businessId}/expenses`, data);
  return response.data;
};

export const getBusinessSales = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/sales`);
  return response.data;
};

export const createBusinessSale = async (businessId, data) => {
  const response = await api.post(`/businesses/${businessId}/sales`, data);
  return response.data;
};
export const updateBusinessWorker = async (
  businessId,
  workerId,
  data
) => {
  const response = await api.put(
    `/businesses/${businessId}/workers/${workerId}`,
    data
  );

  return response.data;
};

export const deleteBusinessWorker = async (
  businessId,
  workerId
) => {
  const response = await api.delete(
    `/businesses/${businessId}/workers/${workerId}`
  );

  return response.data;
};

export const updateBusinessProduction = async (
  businessId,
  productionId,
  data
) => {
  const response = await api.put(
    `/businesses/${businessId}/productions/${productionId}`,
    data
  );

  return response.data;
};

export const deleteBusinessProduction = async (
  businessId,
  productionId
) => {
  const response = await api.delete(
    `/businesses/${businessId}/productions/${productionId}`
  );

  return response.data;
};

export const addBusinessProductionPayment = async (
  businessId,
  productionId,
  monto
) => {
  const response = await api.patch(
    `/businesses/${businessId}/productions/${productionId}/payment`,
    { monto }
  );

  return response.data;
};

export const updateBusinessExpense = async (
  businessId,
  expenseId,
  data
) => {
  const response = await api.put(
    `/businesses/${businessId}/expenses/${expenseId}`,
    data
  );

  return response.data;
};

export const deleteBusinessExpense = async (
  businessId,
  expenseId
) => {
  const response = await api.delete(
    `/businesses/${businessId}/expenses/${expenseId}`
  );

  return response.data;
};

export const updateBusinessSale = async (
  businessId,
  saleId,
  data
) => {
  const response = await api.put(
    `/businesses/${businessId}/sales/${saleId}`,
    data
  );

  return response.data;
};

export const deleteBusinessSale = async (
  businessId,
  saleId
) => {
  const response = await api.delete(
    `/businesses/${businessId}/sales/${saleId}`
  );

  return response.data;
};

export const getBusinessSettlements = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/settlements`);
  return response.data;
};

export const getBusinessSettlementById = async (businessId, settlementId) => {
  const response = await api.get(
    `/businesses/${businessId}/settlements/${settlementId}`
  );
  return response.data;
};

export const createBusinessSettlement = async (businessId, data) => {
  const response = await api.post(
    `/businesses/${businessId}/settlements`,
    data
  );
  return response.data;
};

export const addBusinessSettlementPayment = async (
  businessId,
  settlementId,
  payload
) => {
  const body =
    typeof payload === "object"
      ? payload
      : {
          monto: payload,
        };

  const response = await api.patch(
    `/businesses/${businessId}/settlements/${settlementId}/payment`,
    body
  );

  return response.data;
};

export const markBusinessSettlementAsPaid = async (
  businessId,
  settlementId
) => {
  const response = await api.patch(
    `/businesses/${businessId}/settlements/${settlementId}/mark-paid`
  );
  return response.data;
};

export const deleteBusinessSettlement = async (businessId, settlementId) => {
  const response = await api.delete(
    `/businesses/${businessId}/settlements/${settlementId}`
  );
  return response.data;
};

export const getBusinessUnsettledProductions = async (businessId, params = {}) => {
  const response = await api.get(
    `/businesses/${businessId}/productions-unsettled`,
    { params }
  );
  return response.data;
};

export const getBusinessReports = async (businessId) => {
  const { data } = await api.get(`/businesses/${businessId}/reports`);
  return data;
};

export const cancelBusinessSettlement = async (
  businessId,
  settlementId,
  motivo
) => {
  const response = await api.patch(
    `/businesses/${businessId}/settlements/${settlementId}/cancel`,
    { motivo }
  );

  return response.data;
};