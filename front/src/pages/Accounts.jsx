import { useState } from "react";
import {
  CreditCard,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { deleteAccount } from "../api/financeApi";
import AccountModal from "../components/AccountModal";
import ConfirmModal from "../components/ConfirmModal";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Accounts({
  accounts = [],
  onRefresh,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [selectedAccount, setSelectedAccount] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const openCreate = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const openEdit = (account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleDelete = (account) => {
    setSelectedAccount(account);
  };

  const confirmDelete = async () => {
    if (!selectedAccount) return;

    try {
      setDeleteLoading(true);

      await deleteAccount(selectedAccount._id);

      setSelectedAccount(null);

      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Error eliminando cuenta");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">
            Cuentas
          </h1>

          <p className="mt-2 text-slate-500">
            Administra tarjetas, bancos y servicios.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          <Plus size={20} />
          Nueva cuenta
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        {accounts.map((account) => (
          <article
            key={account._id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <CreditCard size={26} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    {account.nombre}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {account.banco} · {account.tipo}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  account.activa
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {account.activa ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-5">
                <p className="text-sm text-slate-500">
                  Saldo
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  {formatMoney(account.saldo)}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <p className="text-sm text-slate-500">
                  Fecha corte
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  Día {account.fecha_corte}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <p className="text-sm text-slate-500">
                  Fecha pago
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  Día {account.fecha_pago}
                </h3>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => openEdit(account)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Pencil size={18} />
                Editar
              </button>

              <button
                onClick={() => handleDelete(account)}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </section>

      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRefresh}
        editingAccount={editingAccount}
      />

      <ConfirmModal
        open={Boolean(selectedAccount)}
        title="Eliminar cuenta"
        message="Esta acción no se puede deshacer. La cuenta será eliminada permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedAccount(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}