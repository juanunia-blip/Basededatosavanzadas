import { WalletCards, PiggyBank, CreditCard, TrendingUp } from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function StatCards({ summary }) {
  const stats = [
    {
      title: "Balance Global",
      value: formatMoney(summary?.balance),
      icon: WalletCards,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Ingresos Totales",
      value: formatMoney(summary?.totalIncome),
      icon: PiggyBank,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Gastos Totales",
      value: formatMoney(summary?.totalExpense),
      icon: CreditCard,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Ahorro",
      value: formatMoney(summary?.savings),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          >
            <div
              className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
            >
              <Icon className={stat.color} size={26} />
            </div>

            <p className="text-sm font-bold uppercase text-slate-500">
              {stat.title}
            </p>

            <h3 className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </h3>
          </article>
        );
      })}
    </section>
  );
}