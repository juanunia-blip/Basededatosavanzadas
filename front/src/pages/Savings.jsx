import { useState } from "react";
import {
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";

import SavingModal from "../components/SavingModal";
import ConfirmModal from "../components/ConfirmModal";
import { deleteSaving } from "../api/financeApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Savings({ savings = [], onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSaving, setEditingSaving] = useState(null);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalObjective = savings.reduce(
    (acc, item) => acc + Number(item.monto_objetivo || 0),
    0
  );

  const totalSaved = savings.reduce(
    (acc, item) => acc + Number(item.monto_actual || 0),
    0
  );

  const globalProgress =
    totalObjective > 0 ? Math.min((totalSaved / totalObjective) * 100, 100) : 0;

  const openCreate = () => {
    setEditingSaving(null);
    setModalOpen(true);
  };

  const openEdit = (saving) => {
    setEditingSaving(saving);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
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

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">Ahorros</h1>
          <p className="mt-2 text-slate-500">
            Administra tus metas de ahorro y visualiza tu progreso.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          <Plus size={20} />
          Nueva meta
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Target className="mb-4 text-blue-700" size={30} />
          <p className="text-slate-500">Objetivo total</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {formatMoney(totalObjective)}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PiggyBank className="mb-4 text-green-600" size={30} />
          <p className="text-slate-500">Ahorrado total</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {formatMoney(totalSaved)}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <TrendingUp className="mb-4 text-amber-500" size={30} />
          <p className="text-slate-500">Progreso global</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {globalProgress.toFixed(1)}%
          </h2>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-slate-950">
          Metas de ahorro
        </h2>

        <div className="grid gap-5 xl:grid-cols-2">
          {savings.map((saving) => {
            const objective = Number(saving.monto_objetivo || 0);
            const current = Number(saving.monto_actual || 0);
            const percent =
              objective > 0 ? Math.min((current / objective) * 100, 100) : 0;
            const remaining = Math.max(objective - current, 0);

            return (
              <article
                key={saving._id || saving.ahorro_id}
                className="rounded-2xl border border-slate-200 p-6 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                      <PiggyBank size={26} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-950">
                        {saving.meta}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Falta {formatMoney(remaining)}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {percent.toFixed(1)}%
                  </span>
                </div>

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">
                    {formatMoney(current)}
                  </span>
                  <span className="font-medium text-slate-500">
                    {formatMoney(objective)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      percent >= 100 ? "bg-green-600" : "bg-blue-700"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => openEdit(saving)}
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
              </article>
            );
          })}

          {savings.length === 0 && (
            <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
              No hay metas de ahorro registradas.
            </div>
          )}
        </div>
      </section>

      <SavingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRefresh}
        editingSaving={editingSaving}
      />

      <ConfirmModal
        open={Boolean(selectedSaving)}
        title="Eliminar meta de ahorro"
        message="Esta acción no se puede deshacer. La meta será eliminada permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedSaving(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}