import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";

import ConfirmModal from "../components/ConfirmModal";
import EditTransactionModal from "../components/EditTransactionModal";
import { deleteExpense, deleteIncome } from "../api/financeApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Movements({
  incomes = [],
  expenses = [],
  categories = [],
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const perPage = 6;

  const handleDelete = (item) => {
    setSelectedItem(item);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeleteLoading(true);

      if (selectedItem.type === "income") {
        await deleteIncome(selectedItem.id);
      } else {
        await deleteExpense(selectedItem.id);
      }

      setSelectedItem(null);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Error eliminando movimiento");
    } finally {
      setDeleteLoading(false);
    }
  };

  const transactions = useMemo(() => {
    return [
      ...incomes.map((item) => ({
        id: item._id,
        title: item.descripcion || item.fuente || "Ingreso",
        category: item.fuente || "Ingreso",
        amount: Number(item.monto || 0),
        date: item.fecha,
        type: "income",
      })),
      ...expenses.map((item) => ({
        id: item._id,
        title: item.descripcion || "Gasto",
        category: item.categoria_id || "Gasto",
        amount: Number(item.monto || 0),
        date: item.fecha,
        type: "expense",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomes, expenses]);

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "income" && item.type === "income") ||
      (filter === "expense" && item.type === "expense");

    return matchesSearch && matchesFilter;
  });

  const totalIncome = incomes.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  const totalExpense = expenses.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  const balance = totalIncome - totalExpense;
  const totalPages = Math.ceil(filteredTransactions.length / perPage);

  const currentItems = filteredTransactions.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-950">
          Todas las Transacciones
        </h1>

        <p className="mt-2 text-slate-500">
          Historial completo de tus movimientos financieros.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Total Ingresos</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {formatMoney(totalIncome)}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Total Gastos</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {formatMoney(totalExpense)}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Balance Neto</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {formatMoney(balance)}
          </h2>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-md items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-500">
            <Search size={20} />

            <input
              type="text"
              placeholder="Buscar transacción..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal className="text-slate-500" size={22} />

            <select
              value={filter}
              onChange={(e) => changeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
            >
              <option value="all">Todas</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950">
            {filteredTransactions.length} transacciones
          </h2>

          <p className="text-sm text-slate-500">
            Página {page} de {totalPages || 1}
          </p>
        </div>

        <div className="space-y-3">
          {currentItems.map((item) => {
            const isIncome = item.type === "income";

            return (
              <article
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      isIncome ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="text-green-600" size={26} />
                    ) : (
                      <ArrowDownLeft className="text-red-600" size={26} />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {item.category} · {formatDate(item.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <strong
                    className={`text-xl ${
                      isIncome ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMoney(item.amount)}
                  </strong>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            );
          })}

          {currentItems.length === 0 && (
            <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
              No hay transacciones para mostrar.
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(selectedItem)}
        title="Eliminar movimiento"
        message="Esta acción no se puede deshacer. El movimiento será eliminado permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedItem(null)}
        onConfirm={confirmDelete}
      />

      <EditTransactionModal
        open={Boolean(editingItem)}
        transaction={editingItem}
        categories={categories}
        onClose={() => setEditingItem(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}