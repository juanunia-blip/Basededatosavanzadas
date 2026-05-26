import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createBudget, updateBudget } from "../api/financeApi";

export default function BudgetModal({
  open,
  onClose,
  onSuccess,
  categories = [],
  editingBudget = null,
}) {
  const [form, setForm] = useState({
    
    categoria_id: "",
    limite: "",
    mes: "Mayo",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      setForm({
        usuario_id: editingBudget.usuario_id,
        categoria_id: editingBudget.categoria_id || "",
        limite: editingBudget.limite || "",
        mes: editingBudget.mes || "Mayo",
      });
    } else {
      setForm({
        
        categoria_id: "",
        limite: "",
        mes: "Mayo",
      });
    }
  }, [editingBudget]);

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
        categoria_id: form.categoria_id,
        limite: Number(form.limite),
        mes: form.mes,
      };

      if (editingBudget) {
        await updateBudget(editingBudget._id, payload);
      } else {
        await createBudget({
          presupuesto_id: `P${Date.now()}`,
          ...payload,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error guardando presupuesto");
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
              {editingBudget ? "Editar presupuesto" : "Nuevo presupuesto"}
            </h2>
            <p className="mt-2 text-slate-500">
              Define un límite mensual por categoría.
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
              Límite
            </label>

            <input
              type="number"
              name="limite"
              value={form.limite}
              onChange={handleChange}
              required
              min="1"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mes
            </label>

            <input
              type="text"
              name="mes"
              value={form.mes}
              onChange={handleChange}
              required
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
              : editingBudget
              ? "Actualizar presupuesto"
              : "Guardar presupuesto"}
          </button>
        </form>
      </div>
    </div>
  );
}