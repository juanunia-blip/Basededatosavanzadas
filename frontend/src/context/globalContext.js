import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/";
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  const [editingIncome, setEditingIncome] = useState(null);

  const addIncome = async (income) => {
    try {
      await axios.post(`${BASE_URL}add-income`, income);
      getIncomes();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al agregar ingreso");
    }
  };

  const getIncomes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-incomes`);
      setIncomes(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener ingresos");
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-income/${id}`);
      getIncomes();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar ingreso");
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      await axios.put(`${BASE_URL}update-income/${id}`, incomeData);
      setEditingIncome(null);
      getIncomes();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar ingreso");
    }
  };

  const addExpense = async (expense) => {
    try {
      await axios.post(`${BASE_URL}add-expense`, expense);
      getExpenses();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al agregar gasto");
    }
  };

  const getExpenses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-expenses`);
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener gastos");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-expense/${id}`);
      getExpenses();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar gasto");
    }
  };

  const totalIncome = () =>
    incomes.reduce((acc, item) => acc + Number(item.monto || 0), 0);

  const totalExpense = () =>
    expenses.reduce((acc, item) => acc + Number(item.monto || 0), 0);

  const totalBalance = () => totalIncome() - totalExpense();

  const transactionHistory = () => {
    const history = [...incomes, ...expenses];
    history.sort(
      (a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha)
    );
    return history.slice(0, 5);
  };

  return (
    <GlobalContext.Provider
      value={{
        incomes,
        expenses,
        error,
        setError,
        addIncome,
        getIncomes,
        deleteIncome,
        updateIncome,
        editingIncome,
        setEditingIncome,
        addExpense,
        getExpenses,
        deleteExpense,
        totalIncome,
        totalExpense,
        totalBalance,
        transactionHistory,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);