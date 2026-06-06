import { useMemo, useState } from "react";

import {
  Building2,
  MapPin,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import { createBusiness } from "../../api/financeApi";

import LoadingCard from "../../components/LoadingCard";

import { emptyBusinessSummary } from "../../components/utils/businessConstants";
import { formatMoney } from "../../components/utils/businessFormatters";

export default function BusinessList({
  businesses,
  summaries,
  loading,
  onOpenBusiness,
  onReload,
  getBusinessIcon,
  getBusinessBadge,
}) {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    tipo: "finca",
    ciudad: "",
    descripcion: "",
  });

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) =>
      business.nombre?.toLowerCase().includes(search.toLowerCase())
    );
  }, [businesses, search]);

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
      setForm({ nombre: "", tipo: "finca", ciudad: "", descripcion: "" });
      setModalOpen(false);
      await onReload?.();
    } catch (error) {
      alert(error.response?.data?.message || "No se pudo crear el negocio");
    } finally {
      setCreating(false);
    }
  };

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
              <p className="mt-1 text-white/90">Gestiona tus negocios, ventas, gastos y operaciones.</p>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02]">
            <Plus size={18} />
            Crear negocio
          </button>
        </div>
      </section>

      <section>
        <div className="flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={20} className="text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar negocios..." className="w-full bg-transparent outline-none" />
        </div>
      </section>

      {loading ? (
        <LoadingCard text="Cargando negocios..." />
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBusinesses.map((business) => {
            const Icon = getBusinessIcon(business.tipo);
            const summary = summaries[business._id] || emptyBusinessSummary;
            const ingresos = Number(summary.totalVentas || 0);
            const gastos = Number(summary.totalGastosConTrabajadores || 0) || Number(summary.totalGastos || 0) + Number(summary.totalPagoTrabajadores || 0);
            const utilidad = Number(summary.utilidadNeta || 0);
            return (
              <article key={business._id} onClick={() => onOpenBusiness(business)} className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white">
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-950">{business.nombre}</h3>
                <div className="mt-2 flex items-center gap-2 text-slate-500"><MapPin size={15} />{business.ciudad || "Sin ciudad"}</div>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getBusinessBadge(business.tipo)}`}>{business.tipo || "otro"}</div>
                <div className="my-5 border-t border-slate-200" />
                <p className="text-sm text-slate-500">Utilidad neta</p>
                <h4 className={`mt-2 text-4xl font-bold ${utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatMoney(utilidad)}</h4>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-emerald-600"><TrendingUp size={16} /><span className="font-semibold">{formatMoney(ingresos)}</span></div>
                  <div className="flex items-center gap-1 text-red-500"><TrendingDown size={16} /><span className="font-semibold">{formatMoney(gastos)}</span></div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && filteredBusinesses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 size={50} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-900">No se encontraron negocios</h3>
          <p className="mt-2 text-slate-500">Crea tu primer negocio o intenta con otro término de búsqueda.</p>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <form onSubmit={handleCreateBusiness} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Crear negocio</h2>
                <p className="mt-1 text-sm text-slate-500">Registra un negocio para controlar ventas, gastos y utilidad.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del negocio" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500" required />
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500">
                <option value="finca">Finca</option><option value="barberia">Barbería</option><option value="tienda">Tienda</option><option value="restaurante">Restaurante</option><option value="otro">Otro</option>
              </select>
              <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} placeholder="Ciudad" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500" />
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button disabled={creating} className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60">{creating ? "Creando..." : "Crear negocio"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
