import { useState } from "react";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import BudgetModal from "../components/BudgetModal";
import ConfirmModal from "../components/ConfirmModal";
import { deleteBudget } from "../api/financeApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Budgets({
  budgets = [],
  expenses = [],
  categories = [],
  onRefresh,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const openEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
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

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">Presupuestos</h1>
          <p className="mt-2 text-slate-500">
            Controla tus límites mensuales por categoría.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          <Plus size={20} />
          Nuevo presupuesto
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Presupuesto total</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {formatMoney(totalBudget)}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Gastado total</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {formatMoney(totalSpent)}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Disponible</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {formatMoney(totalBudget - totalSpent)}
          </h2>
        </article>
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
                      <p className="text-sm text-slate-500">{budget.mes}</p>
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
                      onClick={() => openEdit(budget)}
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
            <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
              No hay presupuestos registrados.
            </div>
          )}
        </div>
      </section>

      <BudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRefresh}
        categories={categories}
        editingBudget={editingBudget}
      />

      <ConfirmModal
        open={Boolean(selectedBudget)}
        title="Eliminar presupuesto"
        message="Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedBudget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}