import { useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { createBusinessWorker, deleteBusinessWorker, getBusinessWorkers, updateBusinessWorker } from "../../api/financeApi";
import EmptyState from "../../components/EmptyState";
import LoadingCard from "../../components/LoadingCard";
import ModalShell from "../../components/ModalShell";
import SectionHeader from "../../components/SectionHeader";
import { fieldClass } from "../../components/utils/businessStyles";

function BusinessPeople({ business, quickAction, onQuickActionDone }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    rol: "",
  });

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await getBusinessWorkers(business._id);
      setWorkers(data);
    } catch (error) {
      console.error("Error cargando personas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [business._id]);

  useEffect(() => {
    if (quickAction === "persona") {
      openCreateModal();
      onQuickActionDone?.();
    }
  }, [quickAction]);

  const openCreateModal = () => {
    setEditingWorker(null);
    setForm({
      nombre: "",
      telefono: "",
      rol: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);

    setForm({
      nombre: worker.nombre || "",
      telefono: worker.telefono || "",
      rol: worker.rol || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWorker(null);
    setForm({
      nombre: "",
      telefono: "",
      rol: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingWorker) {
        await updateBusinessWorker(business._id, editingWorker._id, form);
      } else {
        await createBusinessWorker(business._id, form);
      }

      closeModal();
      await loadWorkers();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo guardar la persona");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (worker) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar a ${worker.nombre}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteBusinessWorker(business._id, worker._id);
      await loadWorkers();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo eliminar la persona");
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        icon={<UserPlus className="text-violet-600" size={24} />}
        title="Personas del negocio"
        description="Administra trabajadores, barberos, empleados o personas asociadas a este negocio."
        buttonText="Agregar persona"
        onClick={openCreateModal}
      />

      {loading ? (
        <LoadingCard text="Cargando personas..." />
      ) : workers.length === 0 ? (
        <EmptyState
          icon={<Users size={52} />}
          title="No hay personas registradas"
          text="Agrega trabajadores o colaboradores para usarlos luego en producción, servicios y pagos."
          buttonText="Agregar persona"
          onClick={openCreateModal}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workers.map((worker) => (
            <article
              key={worker._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-lg font-bold text-white">
                    {worker.nombre?.charAt(0)?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {worker.nombre}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {worker.rol || "Persona asociada"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    worker.activo
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {worker.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-500">
                <p>
                  <span className="font-semibold text-slate-700">ID:</span>{" "}
                  {worker.trabajador_id || worker._id}
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    Teléfono:
                  </span>{" "}
                  {worker.telefono || "Sin teléfono"}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => openEditModal(worker)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Pencil size={17} />
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(worker)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                >
                  <Trash2 size={17} />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <ModalShell
          title={editingWorker ? "Editar persona" : "Agregar persona"}
          description={
            editingWorker
              ? "Actualiza la información de esta persona."
              : "Registra una persona asociada a este negocio."
          }
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          submitText={editingWorker ? "Guardar cambios" : "Agregar persona"}
        >
          <input
            value={form.nombre}
            onChange={(e) =>
              setForm({
                ...form,
                nombre: e.target.value,
              })
            }
            placeholder="Nombre completo"
            className={fieldClass}
            required
          />

          <input
            value={form.rol}
            onChange={(e) =>
              setForm({
                ...form,
                rol: e.target.value,
              })
            }
            placeholder="Rol o cargo. Ej: Recolector, Barbero, Empleado"
            className={fieldClass}
          />

          <input
            value={form.telefono}
            onChange={(e) =>
              setForm({
                ...form,
                telefono: e.target.value,
              })
            }
            placeholder="Teléfono opcional"
            className={fieldClass}
          />
        </ModalShell>
      )}
    </section>
  );
}

export default BusinessPeople;
