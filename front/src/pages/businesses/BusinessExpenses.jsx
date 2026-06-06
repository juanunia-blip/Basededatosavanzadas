import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { createBusinessExpense, deleteBusinessExpense, getBusinessExpenses, updateBusinessExpense } from "../../api/financeApi";
import ActionButtons from "../../components/ActionButtons";
import DateInput from "../../components/DateInput";
import EmptyState from "../../components/EmptyState";
import LoadingCard from "../../components/LoadingCard";
import ModalShell from "../../components/ModalShell";
import SectionHeader from "../../components/SectionHeader";
import { DataTable, TableCell, TableHeader } from "../../components/DataTable";
import { expenseTypes } from "../../components/utils/businessConstants";
import { formatDate, formatMoney, getToday } from "../../components/utils/businessFormatters";
import { fieldClass, selectClass } from "../../components/utils/businessStyles";

function BusinessExpenses({
  business,
  summary,
  onRefreshSummary,
  quickAction,
  onQuickActionDone,
}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState({
    tipo: "otro",
    tipo_personalizado: "",
    descripcion: "",
    monto: "",
    fecha: getToday(),
  });

  const gastosOperativos = Number(summary?.totalGastos || 0);
  const gastoTrabajadores = Number(summary?.totalPagoTrabajadores || 0);
  const totalGastosNegocio =
    Number(summary?.totalGastosConTrabajadores || 0) ||
    gastosOperativos + gastoTrabajadores;

  const workerExpenseRow = {
    _id: "trabajadores-calculado",
    tipo: "trabajadores",
    descripcion: "Pago de trabajadores liquidado",
    monto: gastoTrabajadores,
    fecha: null,
    calculated: true,
  };

  const resetForm = () => {
    setForm({
      tipo: "otro",
      tipo_personalizado: "",
      descripcion: "",
      monto: "",
      fecha: getToday(),
    });
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getBusinessExpenses(business._id);
      setExpenses(data);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [business._id]);

  useEffect(() => {
    if (quickAction === "gasto") {
      openCreateModal();
      onQuickActionDone?.();
    }
  }, [quickAction]);

  const openCreateModal = () => {
    setEditingExpense(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    const isKnownType = expenseTypes.includes(expense.tipo);

    setForm({
      tipo: isKnownType ? expense.tipo : "personalizado",
      tipo_personalizado: isKnownType ? "" : expense.tipo || "",
      descripcion: expense.descripcion || "",
      monto: expense.monto || "",
      fecha: expense.fecha
        ? new Date(expense.fecha).toISOString().slice(0, 10)
        : getToday(),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monto = Number(form.monto || 0);

    const tipoPersonalizado = form.tipo_personalizado.trim();

    const tipoFinal = form.tipo === "personalizado" ? "otro" : form.tipo;

    const descripcionFinal =
      form.tipo === "personalizado" && tipoPersonalizado
        ? `${tipoPersonalizado} - ${form.descripcion}`
        : form.descripcion;

    if (
      !tipoFinal ||
      !descripcionFinal ||
      monto <= 0 ||
      !form.fecha ||
      (form.tipo === "personalizado" && !tipoPersonalizado)
    ) {
      alert("Tipo, descripción, monto y fecha son obligatorios");
      return;
    }

    const payload = {
      tipo: tipoFinal,
      descripcion: descripcionFinal,
      monto,
      fecha: form.fecha,
    };

    try {
      setSaving(true);

      if (editingExpense) {
        await updateBusinessExpense(business._id, editingExpense._id, payload);
      } else {
        await createBusinessExpense(business._id, payload);
      }

      closeModal();
      await loadExpenses();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo guardar el gasto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar el gasto "${expense.descripcion}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteBusinessExpense(business._id, expense._id);
      await loadExpenses();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo eliminar el gasto");
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        icon={<Receipt className="text-violet-600" size={24} />}
        title="Gastos del negocio"
        description="Registra costos operativos y revisa el pago calculado de trabajadores."
        buttonText="Nuevo gasto"
        onClick={openCreateModal}
      />

      {loading ? (
        <LoadingCard text="Cargando gastos..." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Gastos operativos
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {formatMoney(gastosOperativos)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Gastos creados manualmente.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">
                Trabajadores
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-700">
                {formatMoney(gastoTrabajadores)}
              </p>

              <p className="mt-1 text-xs text-amber-700/70">
                Suma de abonos y liquidaciones pagadas.
              </p>
            </div>

            <div className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-red-700">
                Total gastos del negocio
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700">
                {formatMoney(totalGastosNegocio)}
              </p>

              <p className="mt-1 text-xs text-red-700/70">
                Operativos + trabajadores.
              </p>
            </div>
          </div>

          {expenses.length === 0 && gastoTrabajadores <= 0 ? (
            <EmptyState
              icon={<Receipt size={52} />}
              title="No hay gastos registrados"
              text="Agrega gastos o crea liquidaciones para calcular correctamente la utilidad del negocio."
              buttonText="Nuevo gasto"
              onClick={openCreateModal}
            />
          ) : (
            <DataTable>
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Descripción</TableHeader>
                  <TableHeader>Monto</TableHeader>
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader align="right">Acciones</TableHeader>
                </tr>
              </thead>

              <tbody>
                {gastoTrabajadores > 0 && (
                  <tr className="border-b border-amber-100 bg-amber-50/50">
                    <TableCell>
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                        trabajadores
                      </span>
                    </TableCell>

                    <TableCell strong>
                      <div>
                        <p>Pago de trabajadores liquidado</p>
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          Registro calculado automáticamente desde liquidaciones abonadas o pagadas.
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-red-600">
                      {formatMoney(workerExpenseRow.monto)}
                    </TableCell>

                    <TableCell>Calculado</TableCell>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-400">
                      Automático
                    </td>
                  </tr>
                )}

                {expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <TableCell>
                      <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700">
                        {expense.tipo}
                      </span>
                    </TableCell>

                    <TableCell strong>{expense.descripcion}</TableCell>

                    <TableCell className="font-bold text-red-600">
                      {formatMoney(expense.monto)}
                    </TableCell>

                    <TableCell>{formatDate(expense.fecha)}</TableCell>

                    <td className="px-6 py-4">
                      <ActionButtons
                        onEdit={() => openEditModal(expense)}
                        onDelete={() => handleDelete(expense)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </>
      )}

      {modalOpen && (
        <ModalShell
          title={editingExpense ? "Editar gasto" : "Nuevo gasto"}
          description="Registra una salida de dinero asociada al negocio."
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          submitText={editingExpense ? "Guardar cambios" : "Guardar gasto"}
        >
          <select
            value={form.tipo}
            onChange={(e) =>
              setForm({
                ...form,
                tipo: e.target.value,
              })
            }
            className={selectClass}
          >
            <option value="abono">Abono</option>
            <option value="transporte">Transporte</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="herramientas">Herramientas</option>
            <option value="combustible">Combustible</option>
            <option value="servicios">Servicios</option>
            <option value="otro">Otro</option>
            <option value="personalizado">Otro personalizado</option>
          </select>

          {form.tipo === "personalizado" && (
            <input
              value={form.tipo_personalizado}
              onChange={(e) =>
                setForm({
                  ...form,
                  tipo_personalizado: e.target.value,
                })
              }
              placeholder="Escribe el tipo de gasto. Ej: fertilizante, arriendo, publicidad"
              className={fieldClass}
              required
            />
          )}

          <input
            value={form.descripcion}
            onChange={(e) =>
              setForm({
                ...form,
                descripcion: e.target.value,
              })
            }
            placeholder="Descripción"
            className={fieldClass}
            required
          />

          <input
            type="number"
            min="0"
            value={form.monto}
            onChange={(e) =>
              setForm({
                ...form,
                monto: e.target.value,
              })
            }
            placeholder="Monto"
            className={fieldClass}
            required
          />

          <DateInput
            label="Fecha del gasto"
            value={form.fecha}
            onChange={(e) =>
              setForm({
                ...form,
                fecha: e.target.value,
              })
            }
            required
          />
        </ModalShell>
      )}
    </section>
  );
}

export default BusinessExpenses;
