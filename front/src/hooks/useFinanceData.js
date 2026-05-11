import { useEffect, useMemo, useState } from "react";
import {
  getAccounts,
  getBudgets,
  getCategories,
  getExpenses,
  getIncomes,
  getSavings,
} from "../api/financeApi";

export function useFinanceData() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    try {
      setLoading(true);

      const [
        incomeData,
        expenseData,
        accountData,
        categoryData,
        budgetData,
        savingData,
      ] = await Promise.all([
        getIncomes(),
        getExpenses(),
        getAccounts(),
        getCategories(),
        getBudgets(),
        getSavings(),
      ]);

      setIncomes(incomeData || []);
      setExpenses(expenseData || []);
      setAccounts(accountData || []);
      setCategories(categoryData || []);
      setBudgets(budgetData || []);
      setSavings(savingData || []);
    } catch (error) {
      console.error("Error cargando datos financieros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const summary = useMemo(() => {
    const totalIncome = incomes.reduce(
      (acc, item) => acc + Number(item.monto || 0),
      0
    );

    const totalExpense = expenses.reduce(
      (acc, item) => acc + Number(item.monto || 0),
      0
    );

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      savings: totalIncome - totalExpense,
    };
  }, [incomes, expenses]);

  return {
    incomes,
    expenses,
    accounts,
    categories,
    budgets,
    savings,
    summary,
    loading,
    refetch,
  };
}