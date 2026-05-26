import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  createIncome,
  createExpense,
} from "../api/financeApi";

export default function TransactionModal({
  open,
  onClose,
  type,
  categories = [],
  accounts = [],
  onSuccess,
}) {
  const [form, setForm] = useState({
    
    fuente: "",
    categoria_id: "",
    cuenta_id: "",
    monto: "",
    descripcion: "",
    fecha: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        
        fuente: "",
        categoria_id: "",
        cuenta_id: "",
        monto: "",
        descripcion: "",
        fecha: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (type === "income") {
        await createIncome({
          usuario_id: form.usuario_id,
          fuente: form.fuente,
          monto: Number(form.monto),
          descripcion: form.descripcion,
          fecha: form.fecha,
        });
      } else {
        await createExpense({
          usuario_id: form.usuario_id,
          categoria_id: form.categoria_id,
          cuenta_id: form.cuenta_id || null,
          monto: Number(form.monto),
          descripcion: form.descripcion,
          fecha: form.fecha,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error guardando movimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              {type === "income" ? "Nuevo ingreso" : "Nuevo egreso"}
            </h2>

            <p className="mt-2 text-slate-500">
              Registra un nuevo movimiento financiero.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "income" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fuente de ingreso
              </label>

              <input
                type="text"
                name="fuente"
                value={form.fuente}
                onChange={handleChange}
                required
                placeholder="Ej: Freelance"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Categoría
                </label>

                <select
                  name="categoria_id"
                  value={form.categoria_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option value="">Selecciona una categoría</option>

                  {categories.map((category) => (
                    <option
                      key={category.categoria_id}
                      value={category.categoria_id}
                    >
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cuenta / Tarjeta
                </label>

                <select
                  name="cuenta_id"
                  value={form.cuenta_id}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option value="">Sin cuenta asociada</option>

                  {accounts.map((account) => (
                    <option
                      key={account.cuenta_id}
                      value={account.cuenta_id}
                    >
                      {account.nombre} - {account.banco}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Monto
            </label>

            <input
              type="number"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              required
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>

            <input
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
              placeholder="Descripción del movimiento"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fecha
            </label>

            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl py-4 font-semibold text-white transition ${
              type === "income"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading
              ? "Guardando..."
              : type === "income"
              ? "Guardar ingreso"
              : "Guardar egreso"}
          </button>
        </form>
      </div>
    </div>
  );
}