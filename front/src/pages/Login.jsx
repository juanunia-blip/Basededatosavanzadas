import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  ArrowRight,
  User,
  MapPin,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    ciudad: "",
  });

  const isRegister = mode === "register";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetMode = () => {
    setError("");
    setShowPassword(false);
    setAcceptTerms(false);
    setMode(isRegister ? "login" : "register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister && !acceptTerms) {
      setError("Debes aceptar los términos y la política de privacidad.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await register({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          ciudad: form.ciudad,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100 text-slate-950">
      <section className="hidden lg:flex flex-col justify-between bg-[#08111c] text-white p-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center">
            <Wallet size={26} />
          </div>

          <h1 className="text-2xl font-bold">Gasto Sabio</h1>
        </div>

        <div className="max-w-xl">
          <h2 className="text-5xl font-bold leading-tight mb-8">
            {isRegister
              ? "Comienza tu camino hacia la libertad financiera"
              : "Toma el control de tus finanzas personales"}
          </h2>

          <p className="text-slate-300 text-lg leading-8">
            {isRegister
              ? "Únete y comienza a organizar tus ingresos, gastos y metas con inteligencia financiera."
              : "Administra tus gastos, controla tus ingresos y alcanza tus metas financieras de manera inteligente."}
          </p>

          {isRegister ? (
            <div className="mt-12 space-y-6">
              {[
                "Seguimiento de gastos automático",
                "Reportes y gráficas inteligentes",
                "Metas de ahorro personalizadas",
                "Alertas y recomendaciones",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-900 text-green-400">
                    <Check size={18} />
                  </div>
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-12 mt-12">
              <div>
                <p className="text-green-500 text-3xl font-bold">+50K</p>
                <p className="text-slate-400">Usuarios activos</p>
              </div>
              <div>
                <p className="text-green-500 text-3xl font-bold">$2.5M</p>
                <p className="text-slate-400">Ahorros generados</p>
              </div>
              <div>
                <p className="text-green-500 text-3xl font-bold">98%</p>
                <p className="text-slate-400">Satisfacción</p>
              </div>
            </div>
          )}
        </div>

        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 max-w-2xl">
          <p className="italic text-slate-300 mb-5">
            "Gasto Sabio me ayudó a ahorrar un 30% más cada mes. Ahora tengo
            total claridad de mis finanzas."
          </p>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-900 text-green-400 flex items-center justify-center font-bold">
              MR
            </div>

            <div>
              <p className="font-medium">María Rodríguez</p>
              <p className="text-sm text-slate-400">Emprendedora</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">
            {isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo"}
          </h2>

          <p className="text-slate-500 mb-8">
            {isRegister
              ? "Regístrate gratis y comienza a organizar tus finanzas"
              : "Ingresa tus credenciales para acceder a tu cuenta"}
          </p>

          {isRegister && (
            <>
              <label className="block text-sm mb-2">Nombre completo</label>
              <div className="relative mb-5">
                <User
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={20}
                />
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-200 outline-none"
                  placeholder="Juan Pérez"
                />
              </div>

              <label className="block text-sm mb-2">Ciudad</label>
              <div className="relative mb-5">
                <MapPin
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={20}
                />
                <input
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-200 outline-none"
                  placeholder="Bogotá"
                />
              </div>
            </>
          )}

          <label className="block text-sm mb-2">Correo electrónico</label>
          <div className="relative mb-5">
            <Mail
              className="absolute left-4 top-3.5 text-slate-500"
              size={20}
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-200 outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex justify-between text-sm mb-2">
            <label>Contraseña</label>

            {!isRegister && (
              <button type="button" className="text-blue-700">
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          <div className="relative mb-5">
            <Lock
              className="absolute left-4 top-3.5 text-slate-500"
              size={20}
            />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-300 bg-slate-200 outline-none"
              placeholder="********"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isRegister ? (
            <label className="flex items-start gap-3 text-sm text-slate-600 mb-5">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5"
              />
              <span>
                Acepto los{" "}
                <span className="text-blue-700">términos de servicio</span> y
                la{" "}
                <span className="text-blue-700">política de privacidad</span>
              </span>
            </label>
          ) : (
            <label className="flex items-center gap-3 text-sm text-slate-600 mb-5">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4"
              />
              Recordar mi sesión
            </label>
          )}

          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {loading
              ? "Procesando..."
              : isRegister
              ? "Crear cuenta"
              : "Iniciar sesión"}

            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-sm text-slate-500">
              {isRegister ? "O regístrate con" : "O continúa con"}
            </span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="py-3 rounded-xl border border-slate-300 bg-white"
            >
              Google
            </button>

            <button
              type="button"
              className="py-3 rounded-xl border border-slate-300 bg-white"
            >
              GitHub
            </button>
          </div>

          <p className="text-center mt-8 text-slate-500">
            {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
            <button
              type="button"
              onClick={resetMode}
              className="text-blue-700 font-medium"
            >
              {isRegister ? "Inicia sesión" : "Regístrate gratis"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}