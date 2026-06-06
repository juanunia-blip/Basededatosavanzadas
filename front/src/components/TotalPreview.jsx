import { formatMoney } from "./utils/businessFormatters";

export default function TotalPreview({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-emerald-600">{formatMoney(value)}</p>
    </div>
  );
}
