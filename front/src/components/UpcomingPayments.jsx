import { CalendarDays, CreditCard } from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

function getNextDate(day) {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), day);

  if (date < today) {
    date.setMonth(date.getMonth() + 1);
  }

  return date;
}

function formatDate(date) {
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

function getStatus(date) {
  const today = new Date();
  const difference = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  if (difference <= 0) return "Hoy";
  if (difference === 1) return "Mañana";
  return `${difference} días`;
}

export default function UpcomingPayments({ accounts = [] }) {
  const payments = accounts
    .map((item) => {
      const nextCutDate = getNextDate(item.fecha_corte);

      return {
        id: item._id,
        name: item.nombre,
        bank: item.banco,
        amount: item.saldo,
        date: nextCutDate,
        status: getStatus(nextCutDate),
      };
    })
    .sort((a, b) => a.date - b.date)
    .slice(0, 4);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-14 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <CalendarDays size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Próximas Fechas de Corte
          </h2>
          <p className="mt-2 text-slate-500">
            {payments.length} fechas próximas
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-slate-100 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <CreditCard size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-950">{item.name}</h3>
                <p className="text-sm text-slate-500">
                  {item.bank} · {formatDate(item.date)} · {formatMoney(item.amount)}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
              {item.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}