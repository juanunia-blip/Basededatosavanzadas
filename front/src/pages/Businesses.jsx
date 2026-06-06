import { useEffect, useMemo, useRef, useState } from "react";
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
  Download,
} from "lucide-react";

import {
  getBusinesses,
  createBusiness,
  getBusinessSummary,
  getBusinessReports,

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

const KG_PER_LOAD = 125;

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

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const selectClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const textareaClass =
  "min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const helperTextClass = "mt-2 text-xs text-slate-500";


const sanitizeFileName = (value) =>
  String(value || "reporte")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const downloadCSV = (filename, rows) => {
  if (!rows || rows.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(";")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


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
    totalGastosConTrabajadores: 0,
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
              Number(summary.totalGastosConTrabajadores || 0) ||
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
  const totalGastosConTrabajadores =
    Number(summary?.totalGastosConTrabajadores || 0) ||
    totalGastos + totalPagoTrabajadores;
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
              label="Pago trabajadores"
              value={formatMoney(totalPagoTrabajadores)}
              color="text-amber-600"
            />

            <MetricCard
              icon={<Receipt size={24} />}
              label="Total gastos negocio"
              value={formatMoney(totalGastosConTrabajadores)}
              color="text-red-600"
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
          summary={summary}
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
        <BusinessReports business={business} />
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
    precio_carga: "",
    comprador: "",
    fecha: getToday(),
  });

  const cantidadKg = Number(form.cantidad || 0);
  const precioCarga = Number(form.precio_carga || 0);
  const precioKiloCalculado = precioCarga > 0 ? precioCarga / KG_PER_LOAD : 0;
  const totalVentaCalculado = cantidadKg * precioKiloCalculado;

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
      precio_carga: "",
      comprador: "",
      fecha: getToday(),
    });
    setModalOpen(true);
  };

  const openEditModal = (sale) => {
    setEditingSale(sale);

    const precioKiloGuardado = Number(
      sale.precio_unitario || sale.precio_kilo || 0
    );

    setForm({
      producto: sale.producto || "",
      cantidad: sale.cantidad || sale.kilos || "",
      precio_carga:
        sale.precio_carga || (precioKiloGuardado > 0 ? precioKiloGuardado * KG_PER_LOAD : ""),
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
      precio_carga: "",
      comprador: "",
      fecha: getToday(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cantidad = Number(form.cantidad || 0);
    const precioCargaDia = Number(form.precio_carga || 0);
    const precioKilo = precioCargaDia / KG_PER_LOAD;
    const totalVenta = cantidad * precioKilo;

    if (!form.producto || cantidad <= 0 || precioCargaDia <= 0 || !form.fecha) {
      alert("Producto, kilos vendidos, precio por carga y fecha son obligatorios");
      return;
    }

    const payload = {
      producto: form.producto,
      cantidad,
      kilos: cantidad,
      precio_carga: precioCargaDia,
      precio_unitario: precioKilo,
      precio_kilo: precioKilo,
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
              <TableHeader>Kilos vendidos</TableHeader>
              <TableHeader>Precio kilo</TableHeader>
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
            className={fieldClass}
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
            placeholder="Kilos vendidos. Ej: 250"
            className={fieldClass}
            required
          />

          <div>
            <input
              type="number"
              min="0"
              value={form.precio_carga}
              onChange={(e) =>
                setForm({
                  ...form,
                  precio_carga: e.target.value,
                })
              }
              placeholder="Precio por Carga del día"
              className={fieldClass}
              required
            />

            <p className={helperTextClass}>
              Precio por kilo calculado: {formatMoney(precioKiloCalculado)}
            </p>
          </div>

          <input
            value={form.comprador}
            onChange={(e) =>
              setForm({
                ...form,
                comprador: e.target.value,
              })
            }
            placeholder="Cliente o comprador"
            className={fieldClass}
          />

          <DateInput
            label="Fecha de venta"
            value={form.fecha}
            onChange={(e) =>
              setForm({
                ...form,
                fecha: e.target.value,
              })
            }
            required
          />

          <TotalPreview
            label="Total venta"
            value={totalVentaCalculado}
          />
        </ModalShell>
      )}
    </section>
  );
}

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


function BusinessReports({ business }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await getBusinessReports(business._id);
      setReport(response.reporte || null);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      alert(error.response?.data?.message || "No se pudo cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [business._id]);

  const resumen = report?.resumen || {};
  const ventasPorProducto = report?.ventasPorProducto || [];
  const gastosPorTipo = report?.gastosPorTipo || [];
  const detalleMensual = report?.detalleMensual || [];
  const ultimosMovimientos = report?.ultimosMovimientos || {};
  const fileBaseName = sanitizeFileName(business.nombre);

  const exportResumenGeneral = () => {
    downloadCSV(`resumen_general_${fileBaseName}.csv`, [
      {
        ventas_totales: resumen.totalVentas || 0,
        gastos_operativos: resumen.totalGastosOperativos || 0,
        gastos_trabajadores: resumen.totalGastosTrabajadores || 0,
        gastos_totales: resumen.totalGastos || 0,
        utilidad_neta: resumen.utilidadNeta || 0,
        kilos_vendidos: resumen.totalKilosVendidos || 0,
        kilos_producidos: resumen.totalKilosProducidos || 0,
        kilos_sin_liquidar: resumen.totalKilosSinLiquidar || 0,
        pago_sin_liquidar: resumen.totalPagoSinLiquidar || 0,
        total_liquidado: resumen.totalLiquidado || 0,
        total_abonado: resumen.totalAbonado || 0,
        pendiente_trabajadores: resumen.totalPendienteTrabajadores || 0,
        trabajadores_activos: resumen.trabajadoresActivos || 0,
        total_trabajadores: resumen.totalTrabajadores || 0,
        liquidaciones_pagadas: resumen.liquidaciones?.pagadas || 0,
        liquidaciones_abonadas: resumen.liquidaciones?.abonadas || 0,
        liquidaciones_pendientes: resumen.liquidaciones?.pendientes || 0,
      },
    ]);
  };

  const exportDetalleMensual = () => {
    downloadCSV(
      `reporte_mensual_${fileBaseName}.csv`,
      detalleMensual.map((item) => ({
        periodo: item.periodo,
        ventas: item.ventas || 0,
        gastos_operativos: item.gastosOperativos || 0,
        gastos_trabajadores: item.gastosTrabajadores || 0,
        gastos_totales: item.gastosTotales || 0,
        utilidad_neta: item.utilidadNeta || 0,
        kilos_vendidos: item.kilosVendidos || 0,
        kilos_producidos: item.kilosProducidos || 0,
        producciones: item.producciones || 0,
        liquidaciones: item.liquidaciones || 0,
      }))
    );
  };

  const exportVentasPorProducto = () => {
    downloadCSV(
      `ventas_por_producto_${fileBaseName}.csv`,
      ventasPorProducto.map((item) => ({
        producto: item.producto,
        kilos: item.kilos || 0,
        ventas: item.ventas || 0,
        total: item.total || 0,
      }))
    );
  };

  const exportGastosPorTipo = () => {
    downloadCSV(
      `gastos_por_tipo_${fileBaseName}.csv`,
      gastosPorTipo.map((item) => ({
        tipo: item.tipo,
        total: item.total || 0,
        registros: item.registros || 0,
        calculado: item.calculado ? "sí" : "no",
      }))
    );
  };

  const exportMovimientosRecientes = () => {
    const ventas = (ultimosMovimientos.ventas || []).map((item) => ({
      tipo_movimiento: "venta",
      descripcion: item.producto || "",
      monto: item.total_venta || 0,
      fecha: item.fecha || "",
      detalle: item.comprador || "",
    }));

    const gastos = (ultimosMovimientos.gastos || []).map((item) => ({
      tipo_movimiento: "gasto",
      descripcion: item.descripcion || "",
      monto: item.monto || 0,
      fecha: item.fecha || "",
      detalle: item.tipo || "",
    }));

    const liquidaciones = (ultimosMovimientos.liquidaciones || []).map(
      (item) => ({
        tipo_movimiento: "liquidacion",
        descripcion: item.trabajador_nombre || "",
        monto: item.total_pago || 0,
        fecha: item.fecha_fin || item.fecha_inicio || "",
        detalle: item.estado || "",
      })
    );

    const producciones = (ultimosMovimientos.producciones || []).map(
      (item) => ({
        tipo_movimiento: "produccion",
        descripcion: item.trabajador_nombre || "",
        monto: item.total_pago || 0,
        fecha: item.fecha || "",
        detalle: `${Number(item.kilos || 0)} kg`,
      })
    );

    downloadCSV(`movimientos_recientes_${fileBaseName}.csv`, [
      ...ventas,
      ...gastos,
      ...liquidaciones,
      ...producciones,
    ]);
  };

  if (loading) {
    return <LoadingCard text="Generando reportes del negocio..." />;
  }

  if (!report) {
    return (
      <EmptyState
        icon={<FileText size={52} />}
        title="No se pudo cargar el reporte"
        text="Revisa que el backend tenga activa la ruta de reportes."
        buttonText="Reintentar"
        onClick={loadReport}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
              <FileText className="text-violet-600" size={24} />
              Reportes del negocio
            </h2>

            <p className="mt-1 text-slate-500">
              Analiza el comportamiento mensual, ventas por producto, gastos por tipo y liquidaciones.
            </p>
          </div>

          <button
            onClick={loadReport}
            className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
          >
            <FileText size={18} />
            Actualizar reporte
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ExportButton
            label="Resumen CSV"
            onClick={exportResumenGeneral}
            className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          />

          <ExportButton
            label="Mensual CSV"
            onClick={exportDetalleMensual}
            className="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
          />

          <ExportButton
            label="Ventas CSV"
            onClick={exportVentasPorProducto}
            className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          />

          <ExportButton
            label="Gastos CSV"
            onClick={exportGastosPorTipo}
            className="border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
          />

          <ExportButton
            label="Movimientos CSV"
            onClick={exportMovimientosRecientes}
            className="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100"
          />
        </div>
      </div>

      <ReportMonthlyChart items={detalleMensual} />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-950">
              Detalle mensual
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ventas, gastos y utilidad por mes.
            </p>
          </div>

          {detalleMensual.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Aún no hay movimientos suficientes para mostrar detalle mensual.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <TableHeader>Mes</TableHeader>
                    <TableHeader>Ventas</TableHeader>
                    <TableHeader>Gastos operativos</TableHeader>
                    <TableHeader>Trabajadores</TableHeader>
                    <TableHeader>Utilidad</TableHeader>
                    <TableHeader>Kilos vendidos</TableHeader>
                    <TableHeader>Kilos producidos</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {detalleMensual.map((item) => (
                    <tr
                      key={item.periodo}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <TableCell strong>{item.periodo}</TableCell>

                      <TableCell className="font-semibold text-emerald-600">
                        {formatMoney(item.ventas)}
                      </TableCell>

                      <TableCell className="font-semibold text-red-600">
                        {formatMoney(item.gastosOperativos)}
                      </TableCell>

                      <TableCell className="font-semibold text-amber-600">
                        {formatMoney(item.gastosTrabajadores)}
                      </TableCell>

                      <TableCell
                        className={`font-bold ${
                          Number(item.utilidadNeta || 0) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatMoney(item.utilidadNeta)}
                      </TableCell>

                      <TableCell>{Number(item.kilosVendidos || 0)}</TableCell>
                      <TableCell>{Number(item.kilosProducidos || 0)}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">
            Estado de liquidaciones
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Resumen de pagos a trabajadores.
          </p>

          <div className="mt-5 space-y-3">
            <ReportLine
              label="Total liquidaciones"
              value={Number(resumen.liquidaciones?.total || 0)}
            />
            <ReportLine
              label="Pagadas"
              value={Number(resumen.liquidaciones?.pagadas || 0)}
              valueClass="text-emerald-600"
            />
            <ReportLine
              label="Abonadas"
              value={Number(resumen.liquidaciones?.abonadas || 0)}
              valueClass="text-blue-600"
            />
            <ReportLine
              label="Pendientes"
              value={Number(resumen.liquidaciones?.pendientes || 0)}
              valueClass="text-orange-600"
            />
            <ReportLine
              label="Total liquidado"
              value={formatMoney(resumen.totalLiquidado)}
              valueClass="text-slate-900"
            />
            <ReportLine
              label="Total abonado"
              value={formatMoney(resumen.totalAbonado)}
              valueClass="text-blue-600"
            />
            <ReportLine
              label="Pendiente"
              value={formatMoney(resumen.totalPendienteTrabajadores)}
              valueClass="text-orange-600"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ReportListCard
          title="Ventas por producto"
          description="Productos con más ingresos."
          emptyText="No hay ventas registradas."
          items={ventasPorProducto}
          renderItem={(item) => (
            <div
              key={item.producto}
              className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.producto}</p>
                <p className="text-sm text-slate-500">
                  {Number(item.kilos || 0)} kg · {Number(item.ventas || 0)} ventas
                </p>
              </div>

              <p className="font-bold text-emerald-600">
                {formatMoney(item.total)}
              </p>
            </div>
          )}
        />

        <ReportListCard
          title="Gastos por tipo"
          description="Incluye trabajadores como gasto calculado."
          emptyText="No hay gastos registrados."
          items={gastosPorTipo}
          renderItem={(item) => (
            <div
              key={item.tipo}
              className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0"
            >
              <div>
                <p className="font-semibold capitalize text-slate-900">
                  {item.tipo}
                </p>
                <p className="text-sm text-slate-500">
                  {Number(item.registros || 0)} registros
                  {item.calculado ? " · automático" : ""}
                </p>
              </div>

              <p className="font-bold text-red-600">
                {formatMoney(item.total)}
              </p>
            </div>
          )}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">
            Producción pendiente
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Trabajo registrado que aún no ha sido liquidado.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-700">
                Kilos sin liquidar
              </p>
              <p className="mt-2 text-2xl font-bold text-cyan-700">
                {Number(resumen.totalKilosSinLiquidar || 0)} kg
              </p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-sm font-semibold text-violet-700">
                Pago sin liquidar
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-700">
                {formatMoney(resumen.totalPagoSinLiquidar)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">
            Últimos movimientos
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Actividad reciente del negocio.
          </p>

          <div className="mt-5 space-y-3">
            <ReportLine
              label="Ventas recientes"
              value={Number(ultimosMovimientos.ventas?.length || 0)}
              valueClass="text-emerald-600"
            />
            <ReportLine
              label="Gastos recientes"
              value={Number(ultimosMovimientos.gastos?.length || 0)}
              valueClass="text-red-600"
            />
            <ReportLine
              label="Liquidaciones recientes"
              value={Number(ultimosMovimientos.liquidaciones?.length || 0)}
              valueClass="text-blue-600"
            />
            <ReportLine
              label="Producciones recientes"
              value={Number(ultimosMovimientos.producciones?.length || 0)}
              valueClass="text-cyan-600"
            />
          </div>
        </div>
      </section>
    </section>
  );
}

function ExportButton({ label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${className}`}
    >
      <Download size={16} />
      {label}
    </button>
  );
}

function ReportMonthlyChart({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  const maxValue = Math.max(
    ...items.map((item) =>
      Math.max(
        Number(item.ventas || 0),
        Number(item.gastosTotales || 0),
        Math.abs(Number(item.utilidadNeta || 0))
      )
    ),
    1
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-950">
          Gráfica mensual
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Comparación visual de ventas, gastos y utilidad por mes.
        </p>
      </div>

      <div className="space-y-5">
        {items.map((item) => {
          const ventasWidth = (Number(item.ventas || 0) / maxValue) * 100;
          const gastosWidth =
            (Number(item.gastosTotales || 0) / maxValue) * 100;
          const utilidadWidth =
            (Math.abs(Number(item.utilidadNeta || 0)) / maxValue) * 100;

          return (
            <div key={item.periodo} className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-bold text-slate-900">{item.periodo}</p>

                <p
                  className={`text-sm font-bold ${
                    Number(item.utilidadNeta || 0) >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  Utilidad: {formatMoney(item.utilidadNeta)}
                </p>
              </div>

              <ChartBar
                label="Ventas"
                value={item.ventas}
                width={ventasWidth}
                barClass="bg-emerald-500"
              />

              <ChartBar
                label="Gastos"
                value={item.gastosTotales}
                width={gastosWidth}
                barClass="bg-red-500"
              />

              <ChartBar
                label="Utilidad"
                value={item.utilidadNeta}
                width={utilidadWidth}
                barClass={
                  Number(item.utilidadNeta || 0) >= 0
                    ? "bg-blue-500"
                    : "bg-orange-500"
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChartBar({ label, value, width, barClass }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span>{formatMoney(value)}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-3 rounded-full ${barClass}`}
          style={{ width: `${Math.max(width, 3)}%` }}
        />
      </div>
    </div>
  );
}


function ReportLine({ label, value, valueClass = "text-slate-900" }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

function ReportListCard({ title, description, emptyText, items, renderItem }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <div className="mt-5">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            {emptyText}
          </p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}



function DateInput({ label, value, onChange, required = false, helperText }) {
  const inputRef = useRef(null);

  const openCalendar = () => {
    const input = inputRef.current;

    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}

      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={onChange}
          className={`${fieldClass} cursor-pointer pr-12`}
          required={required}
          onClick={openCalendar}
          onFocus={(e) => {
            if (typeof e.currentTarget.showPicker === "function") {
              e.currentTarget.showPicker();
            }
          }}
        />

        <button
          type="button"
          onClick={openCalendar}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
          aria-label="Abrir calendario"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {helperText && <p className={helperTextClass}>{helperText}</p>}
    </div>
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
  maxWidth = "max-w-lg",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}
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