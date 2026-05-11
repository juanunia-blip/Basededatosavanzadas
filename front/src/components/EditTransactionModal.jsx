import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updateExpense, updateIncome } from "../api/financeApi";

export default function EditTransactionModal({
  open,
  transaction,
  categories = [],
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    fecha: "",
    categoria_id: "",
    fuente: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        descripcion: transaction.title || "",
        monto: transaction.amount || "",
        fecha: transaction.date
          ? new Date(transaction.date).toISOString().split("T")[0]
          : "",
        categoria_id:
          transaction.type === "expense" ? transaction.category : "",
        fuente:
          transaction.type === "income" ? transaction.category : "",
      });
    }
  }, [transaction]);

  if (!open || !transaction) return null;

  const isIncome = transaction.type === "income";

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

      if (isIncome) {
        await updateIncome(transaction.id, {
          descripcion: form.descripcion,
          fuente: form.fuente,
          monto: Number(form.monto),
          fecha: form.fecha,
        });
      } else {
        await updateExpense(transaction.id, {
          descripcion: form.descripcion,
          categoria_id: form.categoria_id,
          monto: Number(form.monto),
          fecha: form.fecha,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error actualizando movimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              {isIncome ? "Editar ingreso" : "Editar gasto"}
            </h2>

            <p className="mt-2 text-slate-500">
              Actualiza la información del movimiento.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          {isIncome ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fuente
              </label>

              <input
                type="text"
                name="fuente"
                value={form.fuente}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          ) : (
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
              min="1"
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
            className={`w-full rounded-2xl py-4 font-semibold text-white transition disabled:opacity-60 ${
              isIncome
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}