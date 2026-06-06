import ChartBar from "./ChartBar";
import { formatMoney } from "../utils/businessFormatters";

export default function ReportMonthlyChart({ items }) {
  if (!items || items.length === 0) return null;
  const maxValue = Math.max(...items.map((item) => Math.max(Number(item.ventas || 0), Number(item.gastosTotales || 0), Math.abs(Number(item.utilidadNeta || 0)))), 1);
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-950">Gráfica mensual</h3>
        <p className="mt-1 text-sm text-slate-500">Comparación visual de ventas, gastos y utilidad por mes.</p>
      </div>
      <div className="space-y-5">
        {items.map((item) => {
          const ventasWidth = (Number(item.ventas || 0) / maxValue) * 100;
          const gastosWidth = (Number(item.gastosTotales || 0) / maxValue) * 100;
          const utilidadWidth = (Math.abs(Number(item.utilidadNeta || 0)) / maxValue) * 100;
          return (
            <div key={item.periodo} className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-bold text-slate-900">{item.periodo}</p>
                <p className={`text-sm font-bold ${Number(item.utilidadNeta || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>Utilidad: {formatMoney(item.utilidadNeta)}</p>
              </div>
              <ChartBar label="Ventas" value={item.ventas} width={ventasWidth} barClass="bg-emerald-500" />
              <ChartBar label="Gastos" value={item.gastosTotales} width={gastosWidth} barClass="bg-red-500" />
              <ChartBar label="Utilidad" value={item.utilidadNeta} width={utilidadWidth} barClass={Number(item.utilidadNeta || 0) >= 0 ? "bg-blue-500" : "bg-orange-500"} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
