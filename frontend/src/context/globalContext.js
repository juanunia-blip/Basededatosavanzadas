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
      const response = await axios.post(`${BASE_URL}add-income`, income);
      getIncomes();
      return response.data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al agregar ingreso");
    }
  };

  const getIncomes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-incomes`);
      setIncomes(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al obtener ingresos");
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-income/${id}`);
      getIncomes();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al eliminar ingreso");
    }
  };

  const addExpense = async (expense) => {
    try {
      const response = await axios.post(`${BASE_URL}add-expense`, expense);
      getExpenses();
      return response.data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al agregar gasto");
    }
  };

  const getExpenses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-expenses`);
      setExpenses(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al obtener gastos");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-expense/${id}`);
      getExpenses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al eliminar gasto");
    }
  };

  const totalIncome = () => {
    return incomes.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  };

  const totalExpense = () => {
    return expenses.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  };

  const totalBalance = () => {
    return totalIncome() - totalExpense();
  };

  return (
    <GlobalContext.Provider
      value={{
        addIncome,
        getIncomes,
        deleteIncome,
        incomes,
        addExpense,
        getExpenses,
        deleteExpense,
        expenses,
        totalIncome,
        totalExpense,
        totalBalance,
        error,
        setError,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};