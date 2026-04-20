import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/";
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  const addIncome = async (income) => {
    try {
      await axios.post(`${BASE_URL}add-income`, income);
      getIncomes();
    } catch (err) {
      setError(err.response?.data?.message || "Error al agregar ingreso");
    }
  };

  const getIncomes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-incomes`);
      setIncomes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener ingresos");
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-income/${id}`);
      getIncomes();
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar ingreso");
    }
  };

  const addExpense = async (expense) => {
    try {
      await axios.post(`${BASE_URL}add-expense`, expense);
      getExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Error al agregar gasto");
    }
  };

  const getExpenses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-expenses`);
      setExpenses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener gastos");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-expense/${id}`);
      getExpenses();
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
    history.sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));
    return history.slice(0, 3);
  };

  return (
    <GlobalContext.Provider
      value={{
        incomes,
        expenses,
        error,
        addIncome,
        getIncomes,
        deleteIncome,
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