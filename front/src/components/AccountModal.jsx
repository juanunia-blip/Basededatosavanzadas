import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createAccount, updateAccount } from "../api/financeApi";

const buildDateFromDay = (day) => {
  if (!day) return "";

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const cleanDay = String(day).padStart(2, "0");

  return `${year}-${month}-${cleanDay}`;
};

const getDayFromDate = (date) => {
  if (!date) return "";
  return Number(String(date).split("-")[2]);
};

export default function AccountModal({
  open,
  onClose,
  onSuccess,
  editingAccount = null,
}) {
  const [form, setForm] = useState({
    usuario_id: "U001",
    nombre: "",
    tipo: "tarjeta_credito",
    banco: "",
    saldo: "",
    fecha_corte: "",
    fecha_pago: "",
    activa: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setForm({
        usuario_id: editingAccount.usuario_id || "U001",
        nombre: editingAccount.nombre || "",
        tipo: editingAccount.tipo || "tarjeta_credito",
        banco: editingAccount.banco || "",
        saldo: editingAccount.saldo || "",
        fecha_corte: buildDateFromDay(editingAccount.fecha_corte),
        fecha_pago: buildDateFromDay(editingAccount.fecha_pago),
        activa: editingAccount.activa ?? true,
      });
    } else {
      setForm({
        usuario_id: "U001",
        nombre: "",
        tipo: "tarjeta_credito",
        banco: "",
        saldo: "",
        fecha_corte: "",
        fecha_pago: "",
        activa: true,
      });
    }
  }, [editingAccount]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...form,
        saldo: Number(form.saldo),
        fecha_corte: getDayFromDate(form.fecha_corte),
        fecha_pago: getDayFromDate(form.fecha_pago),
      };

      if (editingAccount) {
        await updateAccount(editingAccount._id, payload);
      } else {
        await createAccount(payload);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error guardando cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              {editingAccount ? "Editar cuenta" : "Nueva cuenta"}
            </h2>

            <p className="mt-2 text-slate-500">
              Administra tus cuentas bancarias y tarjetas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre
            </label>

            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Banco
            </label>

            <input
              type="text"
              name="banco"
              value={form.banco}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipo
            </label>

            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="tarjeta_credito">Tarjeta crédito</option>
              <option value="tarjeta_debito">Tarjeta débito</option>
              <option value="ahorro">Cuenta ahorro</option>
              <option value="servicio">Servicio</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Saldo
            </label>

            <input
              type="number"
              name="saldo"
              value={form.saldo}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fecha de corte
            </label>

            <input
              type="date"
              name="fecha_corte"
              value={form.fecha_corte}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fecha de pago
            </label>

            <input
              type="date"
              name="fecha_pago"
              value={form.fecha_pago}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              name="activa"
              checked={form.activa}
              onChange={handleChange}
            />

            <label className="text-sm font-medium text-slate-700">
              Cuenta activa
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-700 py-4 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 md:col-span-2"
          >
            {loading
              ? "Guardando..."
              : editingAccount
              ? "Actualizar cuenta"
              : "Guardar cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}