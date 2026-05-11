import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="hidden w-full max-w-md items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-500 shadow-sm md:flex">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-blue-700">
          <Bell size={22} />
          <span className="absolute -right-2 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">
            U
          </div>

          <div className="hidden sm:block">
            <p className="font-semibold text-slate-950">Usuario</p>
            <p className="text-sm text-slate-500">@usuario</p>
          </div>
        </div>
      </div>
    </header>
  );
}