import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, Eye, FileText, HandCoins, Plus, Trash2, Users } from "lucide-react";
import { addBusinessSettlementPayment, createBusinessProduction, createBusinessSettlement, deleteBusinessProduction, deleteBusinessSettlement, getBusinessProductions, getBusinessSettlementById, getBusinessSettlements, getBusinessUnsettledProductions, getBusinessWorkers, markBusinessSettlementAsPaid, updateBusinessProduction } from "../../api/financeApi";
import ActionButtons from "../../components/ActionButtons";
import DateInput from "../../components/DateInput";
import EmptyState from "../../components/EmptyState";
import LoadingCard from "../../components/LoadingCard";
import ModalShell from "../../components/ModalShell";
import StatusBadge from "../../components/StatusBadge";
import TotalPreview from "../../components/TotalPreview";
import { DataTable, TableCell, TableHeader } from "../../components/DataTable";
import { formatDate, formatMoney, getToday } from "../../components/utils/businessFormatters";
import { fieldClass, helperTextClass, labelClass, selectClass, textareaClass } from "../../components/utils/businessStyles";

function BusinessProductions({
  business,
  onRefreshSummary,
  quickAction,
  onQuickActionDone,
}) {
  const [view, setView] = useState("liquidaciones");

  const [productions, setProductions] = useState([]);
  const [unsettledProductions, setUnsettledProductions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);

  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [settlementDetail, setSettlementDetail] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [productionForm, setProductionForm] = useState({
    trabajador_id: "",
    fecha: getToday(),
    kilos: "",
    precio_kilo: "",
    observacion: "",
  });

  const [settlementForm, setSettlementForm] = useState({
    trabajador_id: "",
    fecha_inicio: getToday(),
    fecha_fin: getToday(),
    periodo: "semana",
    abonado: "",
    observacion: "",
  });

  const labels =
    business.tipo === "finca"
      ? {
          title: "Producción y liquidaciones",
          productionButton: "Nueva producción",
          settlementButton: "Crear liquidación",
          quantity: "Kilos",
          price: "Precio por kilo",
          worker: "Trabajador",
        }
      : {
          title: "Operaciones y liquidaciones",
          productionButton: "Nueva operación",
          settlementButton: "Crear liquidación",
          quantity: "Cantidad",
          price: "Precio unitario",
          worker: "Persona",
        };

  const getIdValue = (value) => {
    if (!value) return "";
    if (typeof value === "object") return value._id || "";
    return value;
  };

  const getDateOnly = (value) => {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
  };

  const selectedSettlementWorker = useMemo(() => {
    return workers.find((worker) => worker._id === settlementForm.trabajador_id);
  }, [workers, settlementForm.trabajador_id]);

  const settlementPreview = useMemo(() => {
    if (
      !settlementForm.trabajador_id ||
      !settlementForm.fecha_inicio ||
      !settlementForm.fecha_fin
    ) {
      return {
        items: [],
        totalKilos: 0,
        totalPago: 0,
        precioPromedio: 0,
        abonado: Number(settlementForm.abonado || 0),
        pendiente: 0,
      };
    }

    const items = unsettledProductions.filter((production) => {
      const workerId = getIdValue(production.trabajador_id);
      const productionDate = getDateOnly(production.fecha);

      return (
        workerId === settlementForm.trabajador_id &&
        productionDate >= settlementForm.fecha_inicio &&
        productionDate <= settlementForm.fecha_fin
      );
    });

    const totalKilos = items.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const totalPago = items.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const abonado = Number(settlementForm.abonado || 0);

    return {
      items,
      totalKilos,
      totalPago,
      precioPromedio: totalKilos > 0 ? totalPago / totalKilos : 0,
      abonado,
      pendiente: Math.max(totalPago - abonado, 0),
    };
  }, [
    unsettledProductions,
    settlementForm.trabajador_id,
    settlementForm.fecha_inicio,
    settlementForm.fecha_fin,
    settlementForm.abonado,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productionData, unsettledData, settlementData, workerData] =
        await Promise.all([
          getBusinessProductions(business._id),
          getBusinessUnsettledProductions(business._id),
          getBusinessSettlements(business._id),
          getBusinessWorkers(business._id),
        ]);

      setProductions(productionData);
      setUnsettledProductions(unsettledData);
      setSettlements(settlementData);
      setWorkers(workerData);
    } catch (error) {
      console.error("Error cargando producción/liquidaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business._id]);

  useEffect(() => {
    if (quickAction === "produccion") {
      openCreateProductionModal();
      onQuickActionDone?.();
    }
  }, [quickAction]);

  const openCreateProductionModal = () => {
    setEditingProduction(null);
    setProductionForm({
      trabajador_id: "",
      fecha: getToday(),
      kilos: "",
      precio_kilo: "",
      observacion: "",
    });
    setProductionModalOpen(true);
  };

  const openEditProductionModal = (production) => {
    if (production.liquidacion_id) {
      alert(
        "Esta producción ya está liquidada. Para modificarla, elimina primero la liquidación."
      );
      return;
    }

    setEditingProduction(production);
    setProductionForm({
      trabajador_id:
        production.trabajador_id?._id || production.trabajador_id || "",
      fecha: production.fecha
        ? new Date(production.fecha).toISOString().slice(0, 10)
        : getToday(),
      kilos: production.kilos || "",
      precio_kilo: production.precio_kilo || "",
      observacion: production.observacion || "",
    });
    setProductionModalOpen(true);
  };

  const closeProductionModal = () => {
    setProductionModalOpen(false);
    setEditingProduction(null);
    setProductionForm({
      trabajador_id: "",
      fecha: getToday(),
      kilos: "",
      precio_kilo: "",
      observacion: "",
    });
  };

  const handleProductionSubmit = async (e) => {
    e.preventDefault();

    const kilos = Number(productionForm.kilos || 0);
    const precioKilo = Number(productionForm.precio_kilo || 0);

    if (
      !productionForm.trabajador_id ||
      !productionForm.fecha ||
      kilos <= 0 ||
      precioKilo <= 0
    ) {
      alert(
        `${labels.worker}, fecha, ${labels.quantity} y ${labels.price} son obligatorios`
      );
      return;
    }

    const payload = {
      trabajador_id: productionForm.trabajador_id,
      fecha: productionForm.fecha,
      kilos,
      precio_kilo: precioKilo,
      abonado: 0,
      observacion: productionForm.observacion,
    };

    try {
      setSaving(true);

      if (editingProduction) {
        await updateBusinessProduction(
          business._id,
          editingProduction._id,
          payload
        );
      } else {
        await createBusinessProduction(business._id, payload);
      }

      closeProductionModal();
      await loadData();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo guardar el registro");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduction = async (production) => {
    if (production.liquidacion_id) {
      alert(
        "Esta producción ya está liquidada. Para eliminarla, elimina primero la liquidación."
      );
      return;
    }

    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar este registro de ${production.trabajador_nombre}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteBusinessProduction(business._id, production._id);
      await loadData();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo eliminar el registro");
    }
  };

  const openCreateSettlementModal = () => {
    setSettlementForm({
      trabajador_id: "",
      fecha_inicio: getToday(),
      fecha_fin: getToday(),
      periodo: "semana",
      abonado: "",
      observacion: "",
    });
    setSettlementModalOpen(true);
  };

  const closeSettlementModal = () => {
    setSettlementModalOpen(false);
    setSettlementForm({
      trabajador_id: "",
      fecha_inicio: getToday(),
      fecha_fin: getToday(),
      periodo: "semana",
      abonado: "",
      observacion: "",
    });
  };

  const handleSettlementSubmit = async (e) => {
    e.preventDefault();

    if (
      !settlementForm.trabajador_id ||
      !settlementForm.fecha_inicio ||
      !settlementForm.fecha_fin
    ) {
      alert("Persona, fecha inicial y fecha final son obligatorias");
      return;
    }

    if (settlementForm.fecha_fin < settlementForm.fecha_inicio) {
      alert("La fecha final no puede ser menor que la fecha inicial");
      return;
    }

    if (settlementPreview.items.length === 0) {
      alert(
        "No hay producción sin liquidar para esta persona dentro del rango seleccionado"
      );
      return;
    }

    if (Number(settlementForm.abonado || 0) > settlementPreview.totalPago) {
      alert("El abono inicial no puede ser mayor que el total a pagar");
      return;
    }

    try {
      setSaving(true);

      await createBusinessSettlement(business._id, {
        trabajador_id: settlementForm.trabajador_id,
        fecha_inicio: settlementForm.fecha_inicio,
        fecha_fin: settlementForm.fecha_fin,
        periodo: settlementForm.periodo,
        abonado: Number(settlementForm.abonado || 0),
        observacion: settlementForm.observacion,
      });

      closeSettlementModal();
      setView("liquidaciones");
      await loadData();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo crear la liquidación");
    } finally {
      setSaving(false);
    }
  };

  const openPaymentModal = (settlement) => {
    setSelectedSettlement(settlement);
    setPaymentAmount("");
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedSettlement(null);
    setPaymentAmount("");
    setPaymentModalOpen(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const monto = Number(paymentAmount || 0);

    if (monto <= 0) {
      alert("El abono debe ser mayor que cero");
      return;
    }

    try {
      setSaving(true);

      await addBusinessSettlementPayment(
        business._id,
        selectedSettlement._id,
        monto
      );

      closePaymentModal();
      await loadData();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo registrar el abono");
    } finally {
      setSaving(false);
    }
  };

  const markSettlementPaid = async (settlement) => {
    const confirmPay = window.confirm(
      `¿Marcar como pagada la liquidación de ${settlement.trabajador_nombre}?`
    );

    if (!confirmPay) return;

    try {
      setSaving(true);

      await markBusinessSettlementAsPaid(business._id, settlement._id);

      await loadData();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo marcar como pagada");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSettlement = async (settlement) => {
    const confirmDelete = window.confirm(
      `¿Eliminar la liquidación de ${settlement.trabajador_nombre}? Las producciones volverán a quedar sin liquidar.`
    );

    if (!confirmDelete) return;

    try {
      await deleteBusinessSettlement(business._id, settlement._id);
      await loadData();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo eliminar la liquidación");
    }
  };

  const openDetailModal = async (settlement) => {
    try {
      setSaving(true);
      const detail = await getBusinessSettlementById(
        business._id,
        settlement._id
      );
      setSettlementDetail(detail);
      setDetailModalOpen(true);
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo cargar el detalle");
    } finally {
      setSaving(false);
    }
  };

  const closeDetailModal = () => {
    setSettlementDetail(null);
    setDetailModalOpen(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
              <ClipboardList className="text-violet-600" size={24} />
              {labels.title}
            </h2>

            <p className="mt-1 text-slate-500">
              Registra trabajo diario y luego agrúpalo en liquidaciones por semana, quincena o mes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={openCreateProductionModal}
              className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
            >
              <Plus size={18} />
              {labels.productionButton}
            </button>

            <button
              onClick={openCreateSettlementModal}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            >
              <FileText size={18} />
              {labels.settlementButton}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setView("liquidaciones")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              view === "liquidaciones"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Liquidaciones
          </button>

          <button
            onClick={() => setView("pendientes")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              view === "pendientes"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Sin liquidar
          </button>

          <button
            onClick={() => setView("historial")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              view === "historial"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Historial diario
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingCard text="Cargando producción y liquidaciones..." />
      ) : workers.length === 0 ? (
        <EmptyState
          icon={<Users size={52} />}
          title="Primero agrega una persona"
          text="Para registrar producción u operaciones necesitas tener trabajadores o personas asociadas."
          buttonText="Ir a Personas"
          onClick={() => {}}
          hideButton
        />
      ) : (
        <>
          {view === "liquidaciones" && (
            <>
              {settlements.length === 0 ? (
                <EmptyState
                  icon={<FileText size={52} />}
                  title="No hay liquidaciones"
                  text="Crea una liquidación para agrupar varios días trabajados y manejar abonos."
                  buttonText="Crear liquidación"
                  onClick={openCreateSettlementModal}
                />
              ) : (
                <DataTable>
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHeader>{labels.worker}</TableHeader>
                      <TableHeader>Periodo</TableHeader>
                      <TableHeader>{labels.quantity}</TableHeader>
                      <TableHeader>Total</TableHeader>
                      <TableHeader>Abonado</TableHeader>
                      <TableHeader>Pendiente</TableHeader>
                      <TableHeader>Estado</TableHeader>
                      <TableHeader align="right">Acciones</TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {settlements.map((settlement) => (
                      <tr
                        key={settlement._id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell strong>
                          {settlement.trabajador_nombre}
                        </TableCell>

                        <TableCell>
                          {formatDate(settlement.fecha_inicio)} -{" "}
                          {formatDate(settlement.fecha_fin)}
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-500">
                            {settlement.periodo}
                          </span>
                        </TableCell>

                        <TableCell>
                          {Number(settlement.total_kilos || 0)}
                        </TableCell>

                        <TableCell className="font-bold text-slate-900">
                          {formatMoney(settlement.total_pago)}
                        </TableCell>

                        <TableCell className="font-semibold text-blue-600">
                          {formatMoney(settlement.abonado)}
                        </TableCell>

                        <TableCell className="font-semibold text-orange-600">
                          {formatMoney(settlement.pendiente)}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={settlement.estado} />
                        </TableCell>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openDetailModal(settlement)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-violet-700"
                              title="Ver detalle"
                            >
                              <Eye size={17} />
                            </button>

                            {Number(settlement.pendiente || 0) > 0 && (
                              <button
                                onClick={() => openPaymentModal(settlement)}
                                className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                                title="Abonar"
                              >
                                <HandCoins size={17} />
                              </button>
                            )}

                            {Number(settlement.pendiente || 0) > 0 && (
                              <button
                                onClick={() => markSettlementPaid(settlement)}
                                className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"
                                title="Marcar pagada"
                              >
                                <CheckCircle2 size={17} />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteSettlement(settlement)}
                              className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              title="Eliminar"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              )}
            </>
          )}

          {view === "pendientes" && (
            <>
              {unsettledProductions.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList size={52} />}
                  title="No hay producción pendiente"
                  text="Todo el trabajo diario ya está liquidado o aún no has registrado producción."
                  buttonText={labels.productionButton}
                  onClick={openCreateProductionModal}
                />
              ) : (
                <DataTable>
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHeader>{labels.worker}</TableHeader>
                      <TableHeader>Fecha</TableHeader>
                      <TableHeader>{labels.quantity}</TableHeader>
                      <TableHeader>{labels.price}</TableHeader>
                      <TableHeader>Total</TableHeader>
                      <TableHeader>Observación</TableHeader>
                      <TableHeader align="right">Acciones</TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {unsettledProductions.map((production) => (
                      <tr
                        key={production._id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell strong>
                          {production.trabajador_nombre || "Sin persona"}
                        </TableCell>

                        <TableCell>{formatDate(production.fecha)}</TableCell>

                        <TableCell>{Number(production.kilos || 0)}</TableCell>

                        <TableCell>
                          {formatMoney(production.precio_kilo)}
                        </TableCell>

                        <TableCell className="font-bold text-slate-900">
                          {formatMoney(production.total_pago)}
                        </TableCell>

                        <TableCell>
                          {production.observacion || "Sin observación"}
                        </TableCell>

                        <td className="px-6 py-4">
                          <ActionButtons
                            onEdit={() => openEditProductionModal(production)}
                            onDelete={() => handleDeleteProduction(production)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              )}
            </>
          )}

          {view === "historial" && (
            <>
              {productions.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays size={52} />}
                  title="No hay historial diario"
                  text="Registra producción diaria para verla aquí."
                  buttonText={labels.productionButton}
                  onClick={openCreateProductionModal}
                />
              ) : (
                <DataTable>
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHeader>{labels.worker}</TableHeader>
                      <TableHeader>Fecha</TableHeader>
                      <TableHeader>{labels.quantity}</TableHeader>
                      <TableHeader>{labels.price}</TableHeader>
                      <TableHeader>Total</TableHeader>
                      <TableHeader>Estado</TableHeader>
                      <TableHeader align="right">Acciones</TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {productions.map((production) => (
                      <tr
                        key={production._id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell strong>
                          {production.trabajador_nombre || "Sin persona"}
                        </TableCell>

                        <TableCell>{formatDate(production.fecha)}</TableCell>

                        <TableCell>{Number(production.kilos || 0)}</TableCell>

                        <TableCell>
                          {formatMoney(production.precio_kilo)}
                        </TableCell>

                        <TableCell className="font-bold text-slate-900">
                          {formatMoney(production.total_pago)}
                        </TableCell>

                        <TableCell>
                          {production.liquidacion_id ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Liquidado
                            </span>
                          ) : (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                              Sin liquidar
                            </span>
                          )}
                        </TableCell>

                        <td className="px-6 py-4">
                          {production.liquidacion_id ? (
                            <span className="text-sm text-slate-400">
                              Bloqueado
                            </span>
                          ) : (
                            <ActionButtons
                              onEdit={() => openEditProductionModal(production)}
                              onDelete={() => handleDeleteProduction(production)}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              )}
            </>
          )}
        </>
      )}

      {productionModalOpen && (
        <ModalShell
          title={editingProduction ? "Editar registro" : labels.productionButton}
          description="Registra el trabajo diario. Luego podrás incluirlo en una liquidación."
          onClose={closeProductionModal}
          onSubmit={handleProductionSubmit}
          saving={saving}
          submitText={editingProduction ? "Guardar cambios" : "Guardar registro"}
          maxWidth="max-w-2xl"
        >
          <div className="rounded-3xl border border-violet-100 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-700">
              Registro diario
            </p>

            <p className="mt-1 text-sm text-violet-700/80">
              Este valor queda pendiente hasta que crees una liquidación.
            </p>
          </div>

          <div>
            <label className={labelClass}>{labels.worker}</label>

            <select
              value={productionForm.trabajador_id}
              onChange={(e) =>
                setProductionForm({
                  ...productionForm,
                  trabajador_id: e.target.value,
                })
              }
              className={selectClass}
              required
            >
              <option value="">Selecciona persona</option>

              {workers.map((worker) => (
                <option key={worker._id} value={worker._id}>
                  {worker.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DateInput
              label="Fecha"
              value={productionForm.fecha}
              onChange={(e) =>
                setProductionForm({
                  ...productionForm,
                  fecha: e.target.value,
                })
              }
              required
              helperText="Toca el campo o el ícono para abrir el calendario."
            />

            <div>
              <label className={labelClass}>{labels.quantity}</label>

              <input
                type="number"
                min="0"
                value={productionForm.kilos}
                onChange={(e) =>
                  setProductionForm({
                    ...productionForm,
                    kilos: e.target.value,
                  })
                }
                placeholder={`Ej: ${business.tipo === "finca" ? "120" : "3"}`}
                className={fieldClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{labels.price}</label>

            <input
              type="number"
              min="0"
              value={productionForm.precio_kilo}
              onChange={(e) =>
                setProductionForm({
                  ...productionForm,
                  precio_kilo: e.target.value,
                })
              }
              placeholder={`Ej: ${business.tipo === "finca" ? "800" : "25000"}`}
              className={fieldClass}
              required
            />
          </div>

          <TotalPreview
            label="Total del día"
            value={
              Number(productionForm.kilos || 0) *
              Number(productionForm.precio_kilo || 0)
            }
          />

          <div>
            <label className={labelClass}>Observación opcional</label>

            <textarea
              value={productionForm.observacion}
              onChange={(e) =>
                setProductionForm({
                  ...productionForm,
                  observacion: e.target.value,
                })
              }
              placeholder="Ej: buen rendimiento, jornada completa, pendiente por revisar..."
              className={textareaClass}
            />
          </div>
        </ModalShell>
      )}

      {settlementModalOpen && (
        <ModalShell
          title="Crear liquidación"
          description="Selecciona una persona y un periodo. Antes de guardar verás qué días entrarán en la liquidación."
          onClose={closeSettlementModal}
          onSubmit={handleSettlementSubmit}
          saving={saving}
          submitText="Crear liquidación"
          maxWidth="max-w-3xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>{labels.worker}</label>

              <select
                value={settlementForm.trabajador_id}
                onChange={(e) =>
                  setSettlementForm({
                    ...settlementForm,
                    trabajador_id: e.target.value,
                  })
                }
                className={selectClass}
                required
              >
                <option value="">Selecciona persona</option>

                {workers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Tipo de periodo</label>

              <select
                value={settlementForm.periodo}
                onChange={(e) =>
                  setSettlementForm({
                    ...settlementForm,
                    periodo: e.target.value,
                  })
                }
                className={selectClass}
              >
                <option value="semana">Semana</option>
                <option value="quincena">Quincena</option>
                <option value="mes">Mes</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DateInput
              label="Desde"
              value={settlementForm.fecha_inicio}
              onChange={(e) =>
                setSettlementForm({
                  ...settlementForm,
                  fecha_inicio: e.target.value,
                })
              }
              required
            />

            <DateInput
              label="Hasta"
              value={settlementForm.fecha_fin}
              onChange={(e) =>
                setSettlementForm({
                  ...settlementForm,
                  fecha_fin: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Vista previa
                </p>

                <h3 className="text-xl font-bold text-slate-950">
                  {selectedSettlementWorker?.nombre || "Selecciona una persona"}
                </h3>
              </div>

              <span className="w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                {settlementPreview.items.length} registros incluidos
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  {labels.quantity}
                </p>

                <p className="mt-1 text-xl font-bold text-slate-950">
                  {settlementPreview.totalKilos}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Precio promedio
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {formatMoney(settlementPreview.precioPromedio)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Total a pagar
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {formatMoney(settlementPreview.totalPago)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Pendiente
                </p>

                <p className="mt-1 text-xl font-bold text-orange-600">
                  {formatMoney(settlementPreview.pendiente)}
                </p>
              </div>
            </div>

            {settlementForm.trabajador_id &&
              settlementPreview.items.length === 0 && (
                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
                  No hay producción sin liquidar para esta persona en el rango seleccionado.
                </div>
              )}

            {settlementPreview.items.length > 0 && (
              <div className="mt-4 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                {settlementPreview.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatDate(item.fecha)}
                      </p>

                      <p className="text-sm text-slate-500">
                        {Number(item.kilos || 0)} × {formatMoney(item.precio_kilo)}
                      </p>
                    </div>

                    <p className="font-bold text-slate-950">
                      {formatMoney(item.total_pago)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Abono inicial opcional</label>

            <input
              type="number"
              min="0"
              value={settlementForm.abonado}
              onChange={(e) =>
                setSettlementForm({
                  ...settlementForm,
                  abonado: e.target.value,
                })
              }
              placeholder="Ej: 50000"
              className={fieldClass}
            />

            <p className={helperTextClass}>
              También puedes crear la liquidación y luego registrar abonos desde la tabla.
            </p>
          </div>

          <div>
            <label className={labelClass}>Observación</label>

            <textarea
              value={settlementForm.observacion}
              onChange={(e) =>
                setSettlementForm({
                  ...settlementForm,
                  observacion: e.target.value,
                })
              }
              placeholder="Notas opcionales sobre esta liquidación"
              className={textareaClass}
            />
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Solo se incluirán registros diarios sin liquidar de esta persona dentro del rango seleccionado.
          </div>
        </ModalShell>
      )}

      {paymentModalOpen && (
        <ModalShell
          title="Registrar abono"
          description={`Abono para ${
            selectedSettlement?.trabajador_nombre || "persona"
          }`}
          onClose={closePaymentModal}
          onSubmit={handlePayment}
          saving={saving}
          submitText="Guardar abono"
        >
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Pendiente actual</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatMoney(selectedSettlement?.pendiente || 0)}
            </p>
          </div>

          <input
            type="number"
            min="0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Monto del abono"
            className={fieldClass}
            required
          />
        </ModalShell>
      )}

      {detailModalOpen && (
        <ModalShell
          title="Detalle de liquidación"
          description={settlementDetail?.trabajador_nombre || ""}
          onClose={closeDetailModal}
          onSubmit={(e) => {
            e.preventDefault();
            closeDetailModal();
          }}
          saving={false}
          submitText="Cerrar"
        >
          <div className="grid gap-3 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
            <p>
              <strong>Periodo:</strong>{" "}
              {formatDate(settlementDetail?.fecha_inicio)} -{" "}
              {formatDate(settlementDetail?.fecha_fin)}
            </p>
            <p>
              <strong>Total:</strong>{" "}
              {formatMoney(settlementDetail?.total_pago || 0)}
            </p>
            <p>
              <strong>Abonado:</strong>{" "}
              {formatMoney(settlementDetail?.abonado || 0)}
            </p>
            <p>
              <strong>Pendiente:</strong>{" "}
              {formatMoney(settlementDetail?.pendiente || 0)}
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200">
            {(settlementDetail?.producciones || []).map((item) => (
              <div
                key={item._id}
                className="border-b border-slate-100 p-4 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formatDate(item.fecha)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {Number(item.kilos || 0)} x{" "}
                      {formatMoney(item.precio_kilo)}
                    </p>
                  </div>

                  <strong className="text-slate-900">
                    {formatMoney(item.total_pago)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </ModalShell>
      )}
    </section>
  );
}

export default BusinessProductions;
