import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createSaving, updateSaving } from "../api/financeApi";

export default function SavingModal({
  open,
  onClose,
  onSuccess,
  editingSaving = null,
}) {
  const [form, setForm] = useState({
    usuario_id: "U001",
    meta: "",
    monto_objetivo: "",
    monto_actual: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSaving) {
      setForm({
        usuario_id: editingSaving.usuario_id || "U001",
        meta: editingSaving.meta || "",
        monto_objetivo: editingSaving.monto_objetivo || "",
        monto_actual: editingSaving.monto_actual || "",
      });
    } else {
      setForm({
        usuario_id: "U001",
        meta: "",
        monto_objetivo: "",
        monto_actual: "",
      });
    }
  }, [editingSaving]);

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

      const payload = {
        usuario_id: form.usuario_id,
        meta: form.meta,
        monto_objetivo: Number(form.monto_objetivo),
        monto_actual: Number(form.monto_actual),
      };

      if (editingSaving) {
        await updateSaving(editingSaving._id, payload);
      } else {
        await createSaving(payload);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error guardando meta de ahorro");
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
              {editingSaving ? "Editar meta de ahorro" : "Nueva meta de ahorro"}
            </h2>
            <p className="mt-2 text-slate-500">
              Define una meta y registra tu avance.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Meta
            </label>

            <input
              type="text"
              name="meta"
              value={form.meta}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Monto objetivo
            </label>

            <input
              type="number"
              name="monto_objetivo"
              value={form.monto_objetivo}
              onChange={handleChange}
              required
              min="1"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Monto actual
            </label>

            <input
              type="number"
              name="monto_actual"
              value={form.monto_actual}
              onChange={handleChange}
              required
              min="0"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-700 py-4 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading
              ? "Guardando..."
              : editingSaving
              ? "Actualizar meta"
              : "Guardar meta"}
          </button>
        </form>
      </div>
    </div>
  );
}