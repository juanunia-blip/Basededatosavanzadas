import { useState } from "react";
import {
  Pencil,
  Plus,
  Target,
  Trash2,
  PiggyBank,
  Wallet,
} from "lucide-react";

import BudgetModal from "../components/BudgetModal";
import SavingModal from "../components/SavingModal";
import ConfirmModal from "../components/ConfirmModal";

import {
  deleteBudget,
  deleteSaving,
} from "../api/financeApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Budgets({
  budgets = [],
  savings = [],
  expenses = [],
  categories = [],
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState("budgets");

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [savingModalOpen, setSavingModalOpen] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);
  const [editingSaving, setEditingSaving] = useState(null);

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedSaving, setSelectedSaving] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreateBudget = () => {
    setEditingBudget(null);
    setBudgetModalOpen(true);
  };

  const openEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetModalOpen(true);
  };

  const openCreateSaving = () => {
    setEditingSaving(null);
    setSavingModalOpen(true);
  };

  const openEditSaving = (saving) => {
    setEditingSaving(saving);
    setSavingModalOpen(true);
  };

  const confirmDeleteBudget = async () => {
    if (!selectedBudget) return;

    try {
      setDeleteLoading(true);
      await deleteBudget(selectedBudget._id);
      setSelectedBudget(null);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Error eliminando presupuesto");
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteSaving = async () => {
    if (!selectedSaving) return;

    try {
      setDeleteLoading(true);
      await deleteSaving(selectedSaving._id);
      setSelectedSaving(null);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Error eliminando meta de ahorro");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (id) => {
    return (
      categories.find((category) => category.categoria_id === id)?.nombre ||
      id ||
      "Sin categoría"
    );
  };

  const getSpentByCategory = (categoria_id) => {
    return expenses
      .filter((expense) => expense.categoria_id === categoria_id)
      .reduce((acc, item) => acc + Number(item.monto || 0), 0);
  };

  const totalBudget = budgets.reduce(
    (acc, item) => acc + Number(item.limite || 0),
    0
  );

  const totalSpent = expenses.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  const totalSavingGoal = savings.reduce(
    (acc, item) => acc + Number(item.monto_objetivo || 0),
    0
  );

  const totalSaved = savings.reduce(
    (acc, item) => acc + Number(item.monto_actual || 0),
    0
  );

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">
            Planificación
          </h1>
          <p className="mt-2 text-slate-500">
            Controla tus presupuestos, metas de ahorro y límites financieros.
          </p>
        </div>

        {activeTab === "budgets" ? (
          <button
            onClick={openCreateBudget}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            <Plus size={20} />
            Nuevo presupuesto
          </button>
        ) : (
          <button
            onClick={openCreateSaving}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            <Plus size={20} />
            Nueva meta
          </button>
        )}
      </div>

      <div className="flex w-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button
          onClick={() => setActiveTab("budgets")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
            activeTab === "budgets"
              ? "bg-blue-700 text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Target size={18} />
          Presupuestos
        </button>

        <button
          onClick={() => setActiveTab("savings")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
            activeTab === "savings"
              ? "bg-green-600 text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <PiggyBank size={18} />
          Ahorros
        </button>
      </div>

      {activeTab === "budgets" && (
        <>
          <section className="grid gap-5 md:grid-cols-3">
            <SummaryCard
              label="Presupuesto total"
              value={formatMoney(totalBudget)}
              color="text-blue-700"
            />

            <SummaryCard
              label="Gastado total"
              value={formatMoney(totalSpent)}
              color="text-red-600"
            />

            <SummaryCard
              label="Disponible"
              value={formatMoney(totalBudget - totalSpent)}
              color="text-green-600"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-950">
              Presupuestos por categoría
            </h2>

            <div className="space-y-4">
              {budgets.map((budget) => {
                const spent = getSpentByCategory(budget.categoria_id);
                const limit = Number(budget.limite || 0);
                const percent =
                  limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                return (
                  <article
                    key={budget._id || budget.presupuesto_id}
                    className="rounded-2xl border border-slate-200 p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                          <Target size={22} />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            {getCategoryName(budget.categoria_id)}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {budget.mes}
                          </p>
                        </div>
                      </div>

                      <strong className="text-slate-950">
                        {formatMoney(spent)} / {formatMoney(limit)}
                      </strong>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          percent >= 90
                            ? "bg-red-600"
                            : percent >= 70
                            ? "bg-amber-500"
                            : "bg-blue-700"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {percent.toFixed(1)}% usado
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditBudget(budget)}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil size={17} />
                          Editar
                        </button>

                        <button
                          onClick={() => setSelectedBudget(budget)}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                        >
                          <Trash2 size={17} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {budgets.length === 0 && (
                <EmptyState text="No hay presupuestos registrados." />
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === "savings" && (
        <>
          <section className="grid gap-5 md:grid-cols-3">
            <SummaryCard
              label="Meta total"
              value={formatMoney(totalSavingGoal)}
              color="text-green-600"
            />

            <SummaryCard
              label="Ahorrado"
              value={formatMoney(totalSaved)}
              color="text-blue-700"
            />

            <SummaryCard
              label="Pendiente"
              value={formatMoney(totalSavingGoal - totalSaved)}
              color="text-amber-600"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-950">
              Metas de ahorro
            </h2>

            <div className="space-y-4">
              {savings.map((saving) => {
                const goal = Number(saving.monto_objetivo || 0);
                const current = Number(saving.monto_actual || 0);
                const percent =
                  goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

                return (
                  <article
                    key={saving._id || saving.ahorro_id}
                    className="rounded-2xl border border-slate-200 p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                          <PiggyBank size={22} />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            {saving.meta}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Meta de ahorro
                          </p>
                        </div>
                      </div>

                      <strong className="text-slate-950">
                        {formatMoney(current)} / {formatMoney(goal)}
                      </strong>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {percent.toFixed(1)}% alcanzado
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditSaving(saving)}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil size={17} />
                          Editar
                        </button>

                        <button
                          onClick={() => setSelectedSaving(saving)}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                        >
                          <Trash2 size={17} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {savings.length === 0 && (
                <EmptyState text="No hay metas de ahorro registradas." />
              )}
            </div>
          </section>
        </>
      )}

      <BudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSuccess={onRefresh}
        categories={categories}
        editingBudget={editingBudget}
      />

      <SavingModal
        open={savingModalOpen}
        onClose={() => setSavingModalOpen(false)}
        onSuccess={onRefresh}
        editingSaving={editingSaving}
      />

      <ConfirmModal
        open={Boolean(selectedBudget)}
        title="Eliminar presupuesto"
        message="Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedBudget(null)}
        onConfirm={confirmDeleteBudget}
      />

      <ConfirmModal
        open={Boolean(selectedSaving)}
        title="Eliminar meta de ahorro"
        message="Esta acción no se puede deshacer. La meta será eliminada permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedSaving(null)}
        onConfirm={confirmDeleteSaving}
      />
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </h2>
    </article>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
      {text}
    </div>
  );
}