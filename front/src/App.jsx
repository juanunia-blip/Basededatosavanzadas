import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TransactionModal from "./components/TransactionModal";
import FloatingAssistant from "./components/FloatingAssistant";

import Dashboard from "./pages/Dashboard";
import Movements from "./pages/Movements";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Businesses from "./pages/Businesses";

import { useFinanceData } from "./hooks/useFinanceData";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <PrivateApp />;
}

function PrivateApp() {
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
                accounts={accounts}
                onRefresh={refetch}
                onOpenIncome={() => setIncomeModal(true)}
                onOpenExpense={() => setExpenseModal(true)}
              />
            }
          />

          <Route
            path="/negocios"
            element={<Businesses />}
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
                savings={savings}
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
        accounts={accounts}
        onSuccess={refetch}
      />

      <FloatingAssistant
        incomes={incomes}
        expenses={expenses}
        categories={categories}
        budgets={budgets}
        savings={savings}
      />
    </div>
  );
}

export default App;