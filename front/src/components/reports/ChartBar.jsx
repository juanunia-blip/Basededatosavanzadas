import { formatMoney } from "../utils/businessFormatters";

export default function ChartBar({ label, value, width, barClass }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span>{formatMoney(value)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${barClass}`} style={{ width: `${Math.max(width, 3)}%` }} />
      </div>
    </div>
  );
}
