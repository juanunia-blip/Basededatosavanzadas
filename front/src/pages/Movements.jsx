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

const formatDate = (date) => {
  const cleanDate = String(date).split("T")[0];
  const [year, month, day] = cleanDate.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function Movements({
  incomes = [],
  expenses = [],
  categories = [],
  accounts = [],
  onRefresh,
  onOpenIncome,
  onOpenExpense,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const perPage = 6;

  const getCategoryName = (categoriaId) => {
    const category = categories.find(
      (item) => item.categoria_id === categoriaId
    );

    return category?.nombre || categoriaId || "Sin categoría";
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
        original: item,
      })),
      ...expenses.map((item) => ({
        id: item._id,
        title: item.descripcion || "Gasto",
        category: getCategoryName(item.categoria_id),
        categoria_id: item.categoria_id,
        amount: Number(item.monto || 0),
        date: item.fecha,
        type: "expense",
        original: item,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomes, expenses, categories]);

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

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">
            Todas las Transacciones
          </h1>

          <p className="mt-2 text-slate-500">
            Historial completo de tus movimientos financieros.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onOpenIncome}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            <ArrowUpRight size={20} />
            Nuevo ingreso
          </button>

          <button
            onClick={onOpenExpense}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            <ArrowDownLeft size={20} />
            Nuevo egreso
          </button>
        </div>
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

          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="text-slate-500" size={22} />

            <button
              onClick={() => changeFilter("all")}
              className={`rounded-xl px-4 py-3 font-semibold transition ${
                filter === "all"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => changeFilter("income")}
              className={`rounded-xl px-4 py-3 font-semibold transition ${
                filter === "income"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Ingresos
            </button>

            <button
              onClick={() => changeFilter("expense")}
              className={`rounded-xl px-4 py-3 font-semibold transition ${
                filter === "expense"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Egresos
            </button>
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

        <div className="space-y-4">
          {currentItems.map((item) => {
            const isIncome = item.type === "income";

            return (
              <article
                key={`${item.type}-${item.id}`}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <strong
                      className={`text-xl font-bold ${
                        isIncome ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatMoney(item.amount)}
                    </strong>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil size={17} />
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        <Trash2 size={17} />
                        Eliminar
                      </button>
                    </div>
                  </div>
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
        accounts={accounts}
        onClose={() => setEditingItem(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}