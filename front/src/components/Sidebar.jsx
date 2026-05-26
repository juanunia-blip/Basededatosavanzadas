import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ArrowRightLeft,
  WalletCards,
  FolderOpen,
  Target,
  PiggyBank,
  User,
  CircleHelp,
  LogOut,
  Search,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    section: "GENERAL",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
      },
    ],
  },

  {
    section: "HERRAMIENTAS",
    items: [
      {
        name: "Movimientos",
        icon: ArrowRightLeft,
        path: "/movimientos",
      },

      {
        name: "Cuentas",
        icon: WalletCards,
        path: "/cuentas",
      },

      {
        name: "Categorías",
        icon: FolderOpen,
        path: "/categorias",
      },

      {
        name: "Presupuestos",
        icon: Target,
        path: "/presupuestos",
      },

      {
        name: "Ahorros",
        icon: PiggyBank,
        path: "/ahorros",
      },
    ],
  },

  {
    section: "CONFIGURACIÓN",
    items: [
      {
        name: "Perfil",
        icon: User,
        path: "/perfil",
      },

      {
        name: "Soporte",
        icon: CircleHelp,
        path: "/soporte",
      },
    ],
  },
];

export default function Sidebar() {

  const { user, logout } = useAuth();

  const initial =
    user?.nombre?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 flex-col border-r border-slate-200 bg-white lg:flex">

      {/* LOGO */}

      <div className="flex h-20 items-center gap-3 px-5">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
          <WalletCards size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Gasto Sabio
          </h1>

          <p className="text-xs text-slate-400">
            Control financiero inteligente
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="px-5">

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm">

          <Search size={20} />

          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* USER */}

      <div className="mx-5 mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
            {initial}
          </div>

          <div className="min-w-0">

            <p className="truncate font-semibold text-slate-900">
              {user?.nombre || "Usuario"}
            </p>

            <p className="truncate text-sm text-slate-500">
              {user?.usuario_id || "@usuario"}
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}

      <nav className="mt-8 flex-1 overflow-y-auto px-3">

        {menuItems.map((group) => (
          <div
            key={group.section}
            className="mb-7"
          >
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              {group.section}
            </p>

            <div className="space-y-2">

              {group.items.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                        isActive
                          ? "bg-violet-50 text-violet-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-violet-700"
                      }`
                    }
                  >
                    <Icon size={22} />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* LOGOUT */}

      <div className="border-t border-slate-200 p-4">

        <button
          onClick={logout}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={22} />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}