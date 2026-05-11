import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const months = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function MonthlyTrendChart({
  incomes = [],
  expenses = [],
}) {
  const grouped = {};

  incomes.forEach((item) => {
    const date = new Date(item.fecha);
    const month = months[date.getMonth()];

    if (!grouped[month]) {
      grouped[month] = {
        month,
        ingresos: 0,
        gastos: 0,
      };
    }

    grouped[month].ingresos += Number(item.monto || 0);
  });

  expenses.forEach((item) => {
    const date = new Date(item.fecha);
    const month = months[date.getMonth()];

    if (!grouped[month]) {
      grouped[month] = {
        month,
        ingresos: 0,
        gastos: 0,
      };
    }

    grouped[month].gastos += Number(item.monto || 0);
  });

  const data = Object.values(grouped);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Tendencia Mensual
          </h2>

          <p className="mt-3 text-slate-500">
            Últimos movimientos financieros
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-green-600" />
            Ingresos
          </div>

          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-blue-700" />
            Gastos
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}K`}
            />

            <Tooltip
              formatter={(value) =>
                formatMoney(Number(value))
              }
            />

            <Bar
              dataKey="ingresos"
              fill="#16a34a"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />

            <Bar
              dataKey="gastos"
              fill="#1d4ed8"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}