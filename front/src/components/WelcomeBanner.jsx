import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from "lucide-react";

export default function WelcomeBanner({
  onOpenIncome,
  onOpenExpense,
}) {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-blue-800 to-blue-500 p-8 text-white shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">
            Buenas tardes, Usuario
          </h2>

          <p className="mt-2 text-blue-100">
            Bienvenido a Gasto Sabio, tu panel financiero personal.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onOpenExpense}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            <ArrowDownLeft size={18} />
            Egreso
          </button>

          <button
            onClick={onOpenIncome}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/30"
          >
            <ArrowUpRight size={18} />
            Ingreso
          </button>

        </div>
      </div>
    </section>
  );
}