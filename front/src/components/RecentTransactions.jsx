import { ArrowDownLeft, ArrowUpRight, WalletCards } from "lucide-react";

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

export default function RecentTransactions({ incomes = [], expenses = [] }) {
  const movements = [
    ...incomes.map((item) => ({
      id: item._id,
      title: item.descripcion || item.fuente || "Ingreso",
      category: item.fuente || "Ingreso",
      amount: item.monto,
      date: item.fecha,
      type: "income",
    })),
    ...expenses.map((item) => ({
      id: item._id,
      title: item.descripcion || "Gasto",
      category: item.categoria_id || "Gasto",
      amount: item.monto,
      date: item.fecha,
      type: "expense",
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Movimientos recientes
          </h2>
          <p className="mt-2 text-slate-500">
            Últimas transacciones registradas
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {movements.map((item) => {
          const isIncome = item.type === "income";

          return (
            <article
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between rounded-2xl bg-slate-100 p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isIncome ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <WalletCards
                    className={isIncome ? "text-green-600" : "text-red-600"}
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="text-sm text-slate-500">
                    {item.category} · {formatDate(item.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isIncome ? (
                  <ArrowUpRight className="text-green-600" size={20} />
                ) : (
                  <ArrowDownLeft className="text-red-600" size={20} />
                )}

                <strong className={isIncome ? "text-green-600" : "text-red-600"}>
                  {isIncome ? "+" : "-"}{formatMoney(item.amount)}
                </strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}