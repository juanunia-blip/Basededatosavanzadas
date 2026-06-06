import { Plus } from "lucide-react";

export default function EmptyState({ icon, title, text, buttonText, onClick, hideButton }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex justify-center text-slate-300">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-500">{text}</p>
      {!hideButton && (
        <button onClick={onClick} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700">
          <Plus size={18} />
          {buttonText}
        </button>
      )}
    </div>
  );
}
