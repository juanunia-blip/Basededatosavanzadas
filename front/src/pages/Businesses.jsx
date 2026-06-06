import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Trees,
  Scissors,
  Store,
  X,
  ArrowLeft,
  Wallet,
  Receipt,
  Users,
  Pencil,
  Trash2,
  UserPlus,
  ShoppingCart,
  ClipboardList,
  HandCoins,
  CheckCircle2,
  Eye,
  CalendarDays,
  FileText,
} from "lucide-react";

import {
  getBusinesses,
  createBusiness,
  getBusinessSummary,

  getBusinessWorkers,
  createBusinessWorker,
  updateBusinessWorker,
  deleteBusinessWorker,

  getBusinessSales,
  createBusinessSale,
  updateBusinessSale,
  deleteBusinessSale,

  getBusinessExpenses,
  createBusinessExpense,
  updateBusinessExpense,
  deleteBusinessExpense,

  getBusinessProductions,
  createBusinessProduction,
  updateBusinessProduction,
  deleteBusinessProduction,

  getBusinessSettlements,
  getBusinessSettlementById,
  createBusinessSettlement,
  addBusinessSettlementPayment,
  markBusinessSettlementAsPaid,
  deleteBusinessSettlement,
  getBusinessUnsettledProductions,
} from "../api/financeApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getToday = () => new Date().toISOString().slice(0, 10);

const expenseTypes = [
  "abono",
  "transporte",
  "almuerzo",
  "mantenimiento",
  "herramientas",
  "combustible",
  "servicios",
  "otro",
];

export default function Businesses() {
  const [search, setSearch] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    tipo: "finca",
    ciudad: "",
    descripcion: "",
  });

  const emptySummary = {
    totalVentas: 0,
    totalGastos: 0,
    totalPagoTrabajadores: 0,
    totalAbonado: 0,
    totalPendiente: 0,
    totalKilosSinLiquidar: 0,
    totalPagoSinLiquidar: 0,
    utilidadNeta: 0,
  };

  const loadBusinesses = async () => {
    try {
      setLoading(true);

      const data = await getBusinesses();
      setBusinesses(data);

      const summaryEntries = await Promise.all(
        data.map(async (business) => {
          try {
            const response = await getBusinessSummary(business._id);
            return [business._id, response.resumen];
          } catch (error) {
            console.error("Error cargando resumen:", business.nombre, error);
            return [business._id, emptySummary];
          }
        })
      );

      setSummaries(Object.fromEntries(summaryEntries));
    } catch (error) {
      console.error("Error cargando negocios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) =>
      business.nombre?.toLowerCase().includes(search.toLowerCase())
    );
  }, [businesses, search]);

  const getBusinessIcon = (type) => {
    switch (type) {
      case "finca":
        return Trees;
      case "barberia":
        return Scissors;
      case "tienda":
        return Store;
      default:
        return Building2;
    }
  };

  const getBusinessBadge = (type) => {
    switch (type) {
      case "finca":
        return "bg-violet-50 text-violet-700";
      case "barberia":
        return "bg-blue-50 text-blue-700";
      case "tienda":
        return "bg-cyan-50 text-cyan-700";
      case "restaurante":
        return "bg-indigo-50 text-indigo-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      await createBusiness({
        nombre: form.nombre,
        tipo: form.tipo,
        ciudad: form.ciudad,
        descripcion: form.descripcion,
      });

      setForm({
        nombre: "",
        tipo: "finca",
        ciudad: "",
        descripcion: "",
      });

      setModalOpen(false);
      await loadBusinesses();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo crear el negocio");
    } finally {
      setCreating(false);
    }
  };

  const openBusiness = async (business) => {
    setSelectedBusiness(business);

    const cachedSummary = summaries[business._id];

    if (cachedSummary) {
      setSelectedSummary(cachedSummary);
      return;
    }

    try {
      const response = await getBusinessSummary(business._id);
      setSelectedSummary(response.resumen);

      setSummaries((prev) => ({
        ...prev,
        [business._id]: response.resumen,
      }));
    } catch (error) {
      console.error("Error cargando resumen del negocio:", error);
      setSelectedSummary(emptySummary);
    }
  };

  const refreshSelectedSummary = async () => {
    if (!selectedBusiness?._id) return;

    const response = await getBusinessSummary(selectedBusiness._id);

    setSelectedSummary(response.resumen);

    setSummaries((prev) => ({
      ...prev,
      [selectedBusiness._id]: response.resumen,
    }));
  };

  if (selectedBusiness) {
    return (
      <BusinessDetail
        business={selectedBusiness}
        summary={selectedSummary}
        onBack={() => {
          setSelectedBusiness(null);
          setSelectedSummary(null);
          loadBusinesses();
        }}
        onRefreshSummary={refreshSelectedSummary}
        getBusinessIcon={getBusinessIcon}
        getBusinessBadge={getBusinessBadge}
      />
    );
  }

  return (
    <div className="space-y-8 p-8">
      <section className="rounded-3xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Building2 size={34} />
            </div>

            <div>
              <h1 className="text-4xl font-bold">Mis Negocios</h1>

              <p className="mt-1 text-white/90">
                Gestiona tus negocios, ventas, gastos y operaciones.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02]"
          >
            <Plus size={18} />
            Crear negocio
          </button>
        </div>
      </section>

      <section>
        <div className="flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={20} className="text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar negocios..."
            className="w-full bg-transparent outline-none"
          />
        </div>
      </section>

      {loading ? (
        <LoadingCard text="Cargando negocios..." />
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBusinesses.map((business) => {
            const Icon = getBusinessIcon(business.tipo);
            const summary = summaries[business._id] || emptySummary;

            const ingresos = Number(summary.totalVentas || 0);
            const gastos =
              Number(summary.totalGastos || 0) +
              Number(summary.totalPagoTrabajadores || 0);
            const utilidad = Number(summary.utilidadNeta || 0);

            return (
              <article
                key={business._id}
                onClick={() => openBusiness(business)}
                className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white">
                  <Icon size={28} />
                </div>

                <h3 className="text-2xl font-bold text-slate-950">
                  {business.nombre}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <MapPin size={15} />
                  {business.ciudad || "Sin ciudad"}
                </div>

                <div
                  className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getBusinessBadge(
                    business.tipo
                  )}`}
                >
                  {business.tipo || "otro"}
                </div>

                <div className="my-5 border-t border-slate-200" />

                <p className="text-sm text-slate-500">Utilidad neta</p>

                <h4
                  className={`mt-2 text-4xl font-bold ${
                    utilidad >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatMoney(utilidad)}
                </h4>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp size={16} />
                    <span className="font-semibold">{formatMoney(ingresos)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-red-500">
                    <TrendingDown size={16} />
                    <span className="font-semibold">{formatMoney(gastos)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && filteredBusinesses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 size={50} className="mx-auto mb-4 text-slate-300" />

          <h3 className="text-xl font-bold text-slate-900">
            No se encontraron negocios
          </h3>

          <p className="mt-2 text-slate-500">
            Crea tu primer negocio o intenta con otro término de búsqueda.
          </p>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateBusiness}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Crear negocio
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registra un negocio para controlar ventas, gastos y utilidad.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={form.nombre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombre: e.target.value,
                  })
                }
                placeholder="Nombre del negocio"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
                required
              />

              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              >
                <option value="finca">Finca</option>
                <option value="barberia">Barbería</option>
                <option value="tienda">Tienda</option>
                <option value="restaurante">Restaurante</option>
                <option value="otro">Otro</option>
              </select>

              <input
                value={form.ciudad}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ciudad: e.target.value,
                  })
                }
                placeholder="Ciudad"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              />

              <textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    descripcion: e.target.value,
                  })
                }
                placeholder="Descripción"
                className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                disabled={creating}
                className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {creating ? "Creando..." : "Crear negocio"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function BusinessDetail({
  business,
  summary,
  onBack,
  onRefreshSummary,
  getBusinessIcon,
  getBusinessBadge,
}) {
  const [activeTab, setActiveTab] = useState("resumen");
  const [quickAction, setQuickAction] = useState(null);

  const Icon = getBusinessIcon(business.tipo);

  const totalVentas = Number(summary?.totalVentas || 0);
  const totalGastos = Number(summary?.totalGastos || 0);
  const totalPagoTrabajadores = Number(summary?.totalPagoTrabajadores || 0);
  const totalAbonado = Number(summary?.totalAbonado || 0);
  const totalPendiente = Number(summary?.totalPendiente || 0);
  const totalKilosSinLiquidar = Number(summary?.totalKilosSinLiquidar || 0);
  const totalPagoSinLiquidar = Number(summary?.totalPagoSinLiquidar || 0);
  const utilidadNeta = Number(summary?.utilidadNeta || 0);

  const tabs = [
    "resumen",
    "ventas",
    "gastos",
    business.tipo === "finca" ? "produccion" : "operaciones",
    "personas",
    "reportes",
  ];

  const runQuickAction = (tab, action) => {
    setActiveTab(tab);
    setQuickAction(action);
  };

  const clearQuickAction = () => {
    setQuickAction(null);
  };

  return (
    <div className="space-y-8 p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-600 shadow-sm hover:bg-slate-100"
      >
        <ArrowLeft size={18} />
        Volver a mis negocios
      </button>

      <section className="rounded-3xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Icon size={34} />
            </div>

            <div>
              <h1 className="text-4xl font-bold">{business.nombre}</h1>

              <p className="mt-1 text-white/90">
                {business.descripcion || "Gestión financiera del negocio"}
              </p>
            </div>
          </div>

          <div
            className={`w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold capitalize ${getBusinessBadge(
              business.tipo
            )}`}
          >
            {business.tipo || "otro"}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-white/90">
          <MapPin size={18} />
          {business.ciudad || "Sin ciudad"}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
              activeTab === tab
                ? "bg-violet-600 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab === "produccion"
              ? "Producción"
              : tab === "operaciones"
              ? "Operaciones"
              : tab}
          </button>
        ))}
      </div>

      {activeTab === "resumen" && (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              icon={<TrendingUp size={24} />}
              label="Ventas totales"
              value={formatMoney(totalVentas)}
              color="text-emerald-600"
            />

            <MetricCard
              icon={<Receipt size={24} />}
              label="Gastos operativos"
              value={formatMoney(totalGastos)}
              color="text-red-600"
            />

            <MetricCard
              icon={<Users size={24} />}
              label="Liquidado trabajadores"
              value={formatMoney(totalPagoTrabajadores)}
              color="text-amber-600"
            />

            <MetricCard
              icon={<Wallet size={24} />}
              label="Abonado"
              value={formatMoney(totalAbonado)}
              color="text-blue-600"
            />

            <MetricCard
              icon={<Wallet size={24} />}
              label="Pendiente liquidado"
              value={formatMoney(totalPendiente)}
              color="text-orange-600"
            />

            <MetricCard
              icon={<TrendingUp size={24} />}
              label="Utilidad neta"
              value={formatMoney(utilidadNeta)}
              color={utilidadNeta >= 0 ? "text-emerald-600" : "text-red-600"}
            />

            <MetricCard
              icon={<ClipboardList size={24} />}
              label="Kilos sin liquidar"
              value={`${totalKilosSinLiquidar} kg`}
              color="text-cyan-600"
            />

            <MetricCard
              icon={<HandCoins size={24} />}
              label="Pago sin liquidar"
              value={formatMoney(totalPagoSinLiquidar)}
              color="text-violet-600"
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Acciones rápidas
            </h2>

            <p className="mt-1 text-slate-500">
              Abre directamente el formulario que necesitas.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <button
                onClick={() => runQuickAction("ventas", "venta")}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-6 font-semibold text-emerald-600 transition hover:bg-emerald-100"
              >
                <ShoppingCart size={24} />
                Nueva venta
              </button>

              <button
                onClick={() => runQuickAction("gastos", "gasto")}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-6 font-semibold text-orange-600 transition hover:bg-orange-100"
              >
                <Receipt size={24} />
                Nuevo gasto
              </button>

              <button
                onClick={() =>
                  runQuickAction(
                    business.tipo === "finca" ? "produccion" : "operaciones",
                    "produccion"
                  )
                }
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-6 font-semibold text-cyan-600 transition hover:bg-cyan-100"
              >
                <ClipboardList size={24} />
                {business.tipo === "finca"
                  ? "Registrar producción"
                  : "Registrar operación"}
              </button>

              <button
                onClick={() => runQuickAction("personas", "persona")}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-6 font-semibold text-violet-600 transition hover:bg-violet-100"
              >
                <UserPlus size={24} />
                Agregar persona
              </button>
            </div>
          </section>
        </>
      )}

      {activeTab === "ventas" && (
        <BusinessSales
          business={business}
          onRefreshSummary={onRefreshSummary}
          quickAction={quickAction}
          onQuickActionDone={clearQuickAction}
        />
      )}

      {activeTab === "gastos" && (
        <BusinessExpenses
          business={business}
          onRefreshSummary={onRefreshSummary}
          quickAction={quickAction}
          onQuickActionDone={clearQuickAction}
        />
      )}

      {(activeTab === "produccion" || activeTab === "operaciones") && (
        <BusinessProductions
          business={business}
          onRefreshSummary={onRefreshSummary}
          quickAction={quickAction}
          onQuickActionDone={clearQuickAction}
        />
      )}

      {activeTab === "personas" && (
        <BusinessPeople
          business={business}
          quickAction={quickAction}
          onQuickActionDone={clearQuickAction}
        />
      )}

      {activeTab === "reportes" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Building2 size={46} className="mx-auto mb-4 text-slate-300" />

          <h2 className="text-2xl font-bold text-slate-950">
            Reportes y exportaciones
          </h2>

          <p className="mt-2 text-slate-500">
            Esta sección se conectará cuando configuremos reportes, Excel o CSV.
          </p>
        </section>
      )}
    </div>
  );
}

function BusinessSales({
  business,
  onRefreshSummary,
  quickAction,
  onQuickActionDone,
}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [form, setForm] = useState({
    producto: "",
    cantidad: "",
    precio_unitario: "",
    comprador: "",
    fecha: getToday(),
  });

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getBusinessSales(business._id);
      setSales(data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [business._id]);

  useEffect(() => {
    if (quickAction === "venta") {
      openCreateModal();
      onQuickActionDone?.();
    }
  }, [quickAction]);

  const openCreateModal = () => {
    setEditingSale(null);
    setForm({
      producto: "",
      cantidad: "",
      precio_unitario: "",
      comprador: "",
      fecha: getToday(),
    });
    setModalOpen(true);
  };

  const openEditModal = (sale) => {
    setEditingSale(sale);

    setForm({
      producto: sale.producto || "",
      cantidad: sale.cantidad || sale.kilos || "",
      precio_unitario: sale.precio_unitario || sale.precio_kilo || "",
      comprador: sale.comprador || "",
      fecha: sale.fecha
        ? new Date(sale.fecha).toISOString().slice(0, 10)
        : getToday(),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSale(null);
    setForm({
      producto: "",
      cantidad: "",
      precio_unitario: "",
      comprador: "",
      fecha: getToday(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cantidad = Number(form.cantidad || 0);
    const precioUnitario = Number(form.precio_unitario || 0);
    const totalVenta = cantidad * precioUnitario;

    if (!form.producto || cantidad <= 0 || precioUnitario <= 0 || !form.fecha) {
      alert("Producto, cantidad, precio y fecha son obligatorios");
      return;
    }

    const payload = {
      producto: form.producto,
      cantidad,
      precio_unitario: precioUnitario,
      total_venta: totalVenta,
      fecha: form.fecha,
      comprador: form.comprador,
    };

    try {
      setSaving(true);

      if (editingSale) {
        await updateBusinessSale(business._id, editingSale._id, payload);
      } else {
        await createBusinessSale(business._id, payload);
      }

      closeModal();
      await loadSales();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo guardar la venta");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sale) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar la venta de ${sale.producto}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteBusinessSale(business._id, sale._id);
      await loadSales();
      await onRefreshSummary?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo eliminar la venta");
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        icon={<ShoppingCart className="text-violet-600" size={24} />}
        title="Registro de ventas"
        description="Historial de ventas e ingresos del negocio."
        buttonText="Nueva venta"
        onClick={openCreateModal}
      />

      {loading ? (
        <LoadingCard text="Cargando ventas..." />
      ) : sales.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={52} />}
          title="No hay ventas registradas"
          text="Agrega ventas para calcular ingresos y utilidad del negocio."
          buttonText="Nueva venta"
          onClick={openCreateModal}
        />
      ) : (
        <DataTable>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <TableHeader>Producto</TableHeader>
              <TableHeader>Cantidad</TableHeader>
              <TableHeader>Precio</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Fecha</TableHeader>
              <TableHeader align="right">Acciones</TableHeader>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => {
              const cantidad = Number(sale.cantidad || sale.kilos || 0);
              const precio = Number(sale.precio_unitario || sale.precio_kilo || 0);
              const total = Number(sale.total_venta || cantidad * precio);

              return (
                <tr
                  key={sale._id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <TableCell strong>{sale.producto}</TableCell>
                  <TableCell>{cantidad}</TableCell>
                  <TableCell>{formatMoney(precio)}</TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {formatMoney(total)}
                  </TableCell>
                  <TableCell>{sale.comprador || "Sin cliente"}</TableCell>
                  <TableCell>{formatDate(sale.fecha)}</TableCell>

                  <td className="px-6 py-4">
                    <ActionButtons
                      onEdit={() => openEditModal(sale)}
                      onDelete={() => handleDelete(sale)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}

      {modalOpen && (
        <ModalShell
          title={editingSale ? "Editar venta" : "Nueva venta"}
          description="Registra ingresos de productos o servicios vendidos."
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          submitText={editingSale ? "Guardar cambios" : "Guardar venta"}
        >
          <input
            value={form.producto}
            onChange={(e) =>
              setForm({
                ...form,
                producto: e.target.value,
              })
            }
            placeholder="Producto o servicio"
            className="input"
            required
          />

          <input
            type="number"
            min="0"
            value={form.cantidad}
            onChange={(e) =>
              setForm({
                ...form,
                cantidad: e.target.value,
              })
            }
            placeholder="Cantidad"
            className="input"
            required
          />

          <input
            type="number"
            min="0"
            value={form.precio_unitario}
            onChange={(e) =>
              setForm({
                ...form,
                precio_unitario: e.target.value,
              })
            }
            placeholder="Precio unitario"
            className="input"
            required
          />

          <input
            value={form.comprador}
            onChange={(e) =>
              setForm({
                ...form,
                comprador: e.target.value,
              })
            }
            placeholder="Cliente o comprador"
            className="input"
          />

          <input
            type="date"
            value={form.fecha}
            onChange={(e) =>
              setForm({
                ...form,
                fecha: e.target.value,
              })
            }
            className="input"
            required
          />

          <TotalPreview
            label="Total venta"
            value={Number(form.cantidad || 0) * Number(form.precio_unitario || 0)}
          />
        </ModalShell>
      )}
    </section>
  );
}

function BusinessExpenses({
  business,
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

    const tipoFinal =
      form.tipo === "personalizado"
        ? form.tipo_personalizado.trim()
        : form.tipo;

    if (!tipoFinal || !form.descripcion || monto <= 0 || !form.fecha) {
      alert("Tipo, descripción, monto y fecha son obligatorios");
      return;
    }

    const payload = {
      tipo: tipoFinal,
      descripcion: form.descripcion,
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
        description="Registra costos, compras, transporte, insumos y demás salidas."
        buttonText="Nuevo gasto"
        onClick={openCreateModal}
      />

      {loading ? (
        <LoadingCard text="Cargando gastos..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt size={52} />}
          title="No hay gastos registrados"
          text="Agrega gastos para calcular correctamente la utilidad del negocio."
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
            className="input"
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
              className="input"
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
            className="input"
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
            className="input"
            required
          />

          <input
            type="date"
            value={form.fecha}
            onChange={(e) =>
              setForm({
                ...form,
                fecha: e.target.value,
              })
            }
            className="input"
            required
          />
        </ModalShell>
      )}
    </section>
  );
}

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
      alert("Trabajador, fecha inicio y fecha fin son obligatorios");
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
        >
          <select
            value={productionForm.trabajador_id}
            onChange={(e) =>
              setProductionForm({
                ...productionForm,
                trabajador_id: e.target.value,
              })
            }
            className="input"
            required
          >
            <option value="">Selecciona persona</option>
            {workers.map((worker) => (
              <option key={worker._id} value={worker._id}>
                {worker.nombre}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={productionForm.fecha}
            onChange={(e) =>
              setProductionForm({
                ...productionForm,
                fecha: e.target.value,
              })
            }
            className="input"
            required
          />

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
            placeholder={labels.quantity}
            className="input"
            required
          />

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
            placeholder={labels.price}
            className="input"
            required
          />

          <textarea
            value={productionForm.observacion}
            onChange={(e) =>
              setProductionForm({
                ...productionForm,
                observacion: e.target.value,
              })
            }
            placeholder="Observación"
            className="input min-h-24"
          />

          <TotalPreview
            label="Total del día"
            value={
              Number(productionForm.kilos || 0) *
              Number(productionForm.precio_kilo || 0)
            }
          />
        </ModalShell>
      )}

      {settlementModalOpen && (
        <ModalShell
          title="Crear liquidación"
          description="Agrupa producción diaria de una persona en un periodo."
          onClose={closeSettlementModal}
          onSubmit={handleSettlementSubmit}
          saving={saving}
          submitText="Crear liquidación"
        >
          <select
            value={settlementForm.trabajador_id}
            onChange={(e) =>
              setSettlementForm({
                ...settlementForm,
                trabajador_id: e.target.value,
              })
            }
            className="input"
            required
          >
            <option value="">Selecciona persona</option>
            {workers.map((worker) => (
              <option key={worker._id} value={worker._id}>
                {worker.nombre}
              </option>
            ))}
          </select>

          <select
            value={settlementForm.periodo}
            onChange={(e) =>
              setSettlementForm({
                ...settlementForm,
                periodo: e.target.value,
              })
            }
            className="input"
          >
            <option value="semana">Semana</option>
            <option value="quincena">Quincena</option>
            <option value="mes">Mes</option>
            <option value="personalizado">Personalizado</option>
          </select>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={settlementForm.fecha_inicio}
              onChange={(e) =>
                setSettlementForm({
                  ...settlementForm,
                  fecha_inicio: e.target.value,
                })
              }
              className="input"
              required
            />

            <input
              type="date"
              value={settlementForm.fecha_fin}
              onChange={(e) =>
                setSettlementForm({
                  ...settlementForm,
                  fecha_fin: e.target.value,
                })
              }
              className="input"
              required
            />
          </div>

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
            placeholder="Abono inicial opcional"
            className="input"
          />

          <textarea
            value={settlementForm.observacion}
            onChange={(e) =>
              setSettlementForm({
                ...settlementForm,
                observacion: e.target.value,
              })
            }
            placeholder="Observación"
            className="input min-h-24"
          />

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Se incluirán solo producciones sin liquidar de esta persona dentro
            del rango de fechas seleccionado.
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
            className="input"
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
            className="input"
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
            className="input"
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
            className="input"
          />
        </ModalShell>
      )}
    </section>
  );
}

function SectionHeader({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
          {icon}
          {title}
        </h2>

        <p className="mt-1 text-slate-500">{description}</p>
      </div>

      <button
        onClick={onClick}
        className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
      >
        <Plus size={18} />
        {buttonText}
      </button>
    </div>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  onSubmit,
  saving,
  submitText,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{title}</h2>

            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            disabled={saving}
            className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : submitText}
          </button>
        </div>
      </form>
    </div>
  );
}

function EmptyState({ icon, title, text, buttonText, onClick, hideButton }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex justify-center text-slate-300">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-slate-500">{text}</p>

      {!hideButton && (
        <button
          onClick={onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
        >
          <Plus size={18} />
          {buttonText}
        </button>
      )}
    </div>
  );
}

function LoadingCard({ text }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
      {text}
    </div>
  );
}

function DataTable({ children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">{children}</table>
      </div>
    </div>
  );
}

function TableHeader({ children, align = "left" }) {
  return (
    <th
      className={`px-6 py-4 text-sm font-bold text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, strong, className = "" }) {
  return (
    <td
      className={`px-6 py-4 text-slate-600 ${
        strong ? "font-semibold text-slate-900" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-violet-700"
        title="Editar"
      >
        <Pencil size={17} />
      </button>

      <button
        onClick={onDelete}
        className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100"
        title="Eliminar"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pendiente: "bg-orange-50 text-orange-700",
    abonado: "bg-blue-50 text-blue-700",
    pagado: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "pendiente"}
    </span>
  );
}

function TotalPreview({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-emerald-600">
        {formatMoney(value)}
      </p>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`${color} mb-4`}>{icon}</div>

      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}