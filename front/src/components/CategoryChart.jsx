import { Home, Utensils, Car, Wifi, Gamepad2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const icons = [Home, Utensils, Car, Wifi, Gamepad2];
const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function CategoryChart({ expenses = [] }) {
  const total = expenses.reduce((acc, item) => acc + Number(item.monto || 0), 0);

  const categories = expenses.reduce((acc, item) => {
    const name = item.categoria || item.category || "Sin categoría";

    acc[name] = (acc[name] || 0) + Number(item.monto || 0);
    return acc;
  }, {});

  const data = Object.entries(categories).map(([name, value], index) => ({
    name,
    value,
    percent: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
    color: colors[index % colors.length],
    Icon: icons[index % icons.length],
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Distribución por Categorías
        </h2>
        <p className="mt-3 text-slate-500">Gastos del mes</p>
      </div>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="relative h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-slate-500">Total gastado</span>
            <strong className="text-xl font-bold text-slate-950">
              {formatMoney(total)}
            </strong>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase text-slate-500">
            <span>Desglose por categoría</span>
            <span>{data.length} categorías</span>
          </div>

          <div className="space-y-3">
            {data.map((item) => {
              const Icon = item.Icon;

              return (
                <article
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-100 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200">
                      <Icon className="text-blue-700" size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">{item.name}</h3>
                      <p className="text-sm text-slate-500">
                        {formatMoney(item.value)}
                      </p>
                    </div>
                  </div>

                  <strong className="text-slate-600">{item.percent}%</strong>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}