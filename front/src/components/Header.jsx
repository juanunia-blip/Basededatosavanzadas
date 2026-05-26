import { Search } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Header() {

  const { user } = useAuth();

  const initial =
    user?.nombre?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* SEARCH */}

      <div className="hidden w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm md:flex">

        <Search size={20} />

        <input
          type="text"
          placeholder="Buscar movimientos, cuentas, categorías..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* USER */}

      <div className="ml-auto flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
          {initial}
        </div>

        <div className="hidden sm:block">
          <p className="font-semibold text-slate-950">
            {user?.nombre || "Usuario"}
          </p>

          <p className="text-sm text-slate-500">
            {user?.usuario_id || "@usuario"}
          </p>
        </div>
      </div>
    </header>
  );
}