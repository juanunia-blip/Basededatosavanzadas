import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createCategory, updateCategory } from "../api/financeApi";

export default function CategoryModal({
  open,
  onClose,
  onSuccess,
  editingCategory = null,
}) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNombre(editingCategory?.nombre || "");
  }, [editingCategory]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingCategory) {
        await updateCategory(editingCategory._id, { nombre });
      } else {
        await createCategory({
          categoria_id: `C${Date.now()}`,
          nombre,
        });
      }

      setNombre("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error guardando categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <p className="mt-2 text-slate-500">
              Administra tus categorías de gastos.
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
              Nombre
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Tecnología"
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
              : editingCategory
              ? "Actualizar categoría"
              : "Guardar categoría"}
          </button>
        </form>
      </div>
    </div>
  );
}