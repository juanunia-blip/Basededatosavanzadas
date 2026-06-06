import { useState } from "react";
import { ArrowLeft, ClipboardList, HandCoins, MapPin, Receipt, ShoppingCart, TrendingUp, UserPlus, Users, Wallet } from "lucide-react";
import BusinessSales from "./BusinessSales";
import BusinessExpenses from "./BusinessExpenses";
import BusinessProductions from "./BusinessProductions";
import BusinessPeople from "./BusinessPeople";
import BusinessReports from "./BusinessReports";
import MetricCard from "../../components/MetricCard";
import { formatMoney } from "../../components/utils/businessFormatters";

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

export default BusinessDetail;
