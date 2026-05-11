import { useState } from "react";
import { FolderOpen, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import CategoryModal from "../components/CategoryModal";
import ConfirmModal from "../components/ConfirmModal";
import { deleteCategory } from "../api/financeApi";

export default function Categories({ categories = [], onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      setDeleteLoading(true);
      await deleteCategory(selectedCategory._id);
      setSelectedCategory(null);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      alert("Error eliminando categoría");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">Categorías</h1>
          <p className="mt-2 text-slate-500">
            Administra las categorías utilizadas en tus gastos.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={20} />
          Nueva categoría
        </button>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <FolderOpen size={24} />
          </div>

          <p className="text-slate-500">Total categorías</p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {categories.length}
          </h2>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-slate-950">
          Listado de categorías
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category._id || category.categoria_id}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-blue-700">
                    <Tag size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {category.nombre}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Código: {category.categoria_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => openEdit(category)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Pencil size={17} />
                  Editar
                </button>

                <button
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                >
                  <Trash2 size={17} />
                  Eliminar
                </button>
              </div>
            </article>
          ))}

          {categories.length === 0 && (
            <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
              No hay categorías registradas.
            </div>
          )}
        </div>
      </section>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRefresh}
        editingCategory={editingCategory}
      />

      <ConfirmModal
        open={Boolean(selectedCategory)}
        title="Eliminar categoría"
        message="Esta acción no se puede deshacer. La categoría será eliminada permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onCancel={() => setSelectedCategory(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}