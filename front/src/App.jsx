import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TransactionModal from "./components/TransactionModal";

import Dashboard from "./pages/Dashboard";
import Movements from "./pages/Movements";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import Profile from "./pages/Profile";

import { useFinanceData } from "./hooks/useFinanceData";

function App() {
  const {
    incomes,
    expenses,
    accounts,
    categories,
    budgets,
    savings,
    user,
    summary,
    loading,
    refetch,
  } = useFinanceData();

  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-slate-600">
          Cargando datos financieros...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="min-h-screen lg:pl-80">
        <Header />

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                incomes={incomes}
                expenses={expenses}
                accounts={accounts}
                categories={categories}
                summary={summary}
                onOpenIncome={() => setIncomeModal(true)}
                onOpenExpense={() => setExpenseModal(true)}
              />
            }
          />

          <Route
            path="/movimientos"
            element={
              <Movements
                incomes={incomes}
                expenses={expenses}
                categories={categories}
                onRefresh={refetch}
              />
            }
          />

          <Route
            path="/categorias"
            element={
              <Categories
                categories={categories}
                onRefresh={refetch}
              />
            }
          />

          <Route
            path="/cuentas"
            element={
              <Accounts
                accounts={accounts}
                onRefresh={refetch}
              />
            }
          />

          <Route
            path="/presupuestos"
            element={
              <Budgets
                budgets={budgets}
                expenses={expenses}
                categories={categories}
                onRefresh={refetch}
              />
            }
          />

          <Route
            path="/ahorros"
            element={
              <Savings
                savings={savings}
                onRefresh={refetch}
              />
            }
          />

          <Route
            path="/perfil"
            element={
              <Profile
                user={user}
                onRefresh={refetch}
              />
            }
          />
        </Routes>
      </main>

      <TransactionModal
        open={incomeModal}
        onClose={() => setIncomeModal(false)}
        type="income"
        onSuccess={refetch}
      />

      <TransactionModal
        open={expenseModal}
        onClose={() => setExpenseModal(false)}
        type="expense"
        categories={categories}
        onSuccess={refetch}
      />
    </div>
  );
}

export default App;