import { ReceiptText } from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });

export default function TopExpenses({ expenses = [] }) {
  const topExpenses = [...expenses]
    .sort((a, b) => Number(b.monto || 0) - Number(a.monto || 0))
    .slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-14 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ReceiptText size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Top 5 Gastos del Mes
          </h2>
          <p className="mt-2 text-slate-500">Tus mayores gastos este mes</p>
        </div>
      </div>

      <div className="space-y-4">
        {topExpenses.map((item, index) => (
          <article
            key={item._id}
            className="flex items-center justify-between rounded-2xl bg-slate-100 p-4"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-500">
                {index + 1}
              </span>

              <div>
                <h3 className="font-semibold text-slate-950">
                  {item.descripcion || "Gasto"}
                </h3>
                <p className="text-sm text-slate-500">
                  {item.categoria_id || "Sin categoría"} · {formatDate(item.fecha)}
                </p>
              </div>
            </div>

            <strong className="text-red-600">
              -{formatMoney(item.monto)}
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}