import { Plus } from "lucide-react";

export default function SectionHeader({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">{icon}{title}</h2>
        <p className="mt-1 text-slate-500">{description}</p>
      </div>
      <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700">
        <Plus size={18} />
        {buttonText}
      </button>
    </div>
  );
}
