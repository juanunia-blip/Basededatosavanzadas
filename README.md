# 💰 Gasto Sabio — Plataforma Inteligente de Finanzas Personales con IA

Gasto Sabio es una aplicación moderna de control financiero personal impulsada por inteligencia artificial.

El objetivo del proyecto no es solo registrar ingresos y gastos, sino convertir la IA en el núcleo principal de la experiencia financiera del usuario.

La plataforma permite:
- gestionar finanzas personales
- analizar hábitos financieros
- generar recomendaciones automáticas
- detectar excesos
- controlar presupuestos
- administrar cuentas y tarjetas
- crear metas de ahorro
- conversar con un agente financiero inteligente

---

# 🚀 Tecnologías

## Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

## Backend
- Node.js
- Express
- MongoDB
- Mongoose

## Inteligencia Artificial
- OpenAI API
- Gemini API
- Agente local offline fallback

---

# 🧠 Características IA

La aplicación incluye un agente financiero inteligente capaz de:

- responder preguntas financieras
- analizar gastos
- detectar patrones
- generar insights automáticos
- sugerir ahorro
- comparar comportamiento financiero
- detectar excesos de presupuesto
- generar alertas inteligentes
- entender historial conversacional
- analizar cuentas y tarjetas

Ejemplos:

```txt
¿En qué estoy gastando más?
¿Cómo puedo ahorrar este mes?
¿Qué cuenta uso más?
¿Estoy excediendo mi presupuesto?
Compárame este mes con el anterior


📁 Estructura del Proyecto
frontend/
backend/
⚙️ Backend
Instalar dependencias
cd backend
npm install
Dependencias IA
npm install openai @google/genai
🔐 Variables de entorno
backend/.env
PORT=5000

MONGO_URL=mongodb://127.0.0.1:27017/expense_tracker

# =========================================
# AI CONFIG
# =========================================

# local
# openai
# gemini
AI_PROVIDER=local

# =========================================
# OPENAI
# =========================================

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

# =========================================
# GEMINI
# =========================================

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
▶️ Ejecutar Backend
npm run dev

o

nodemon app.js

Servidor:

http://localhost:5000
🎨 Frontend
Instalar dependencias
cd frontend
npm install
Ejecutar frontend
npm run dev

Frontend:

http://localhost:5173
🗃️ Módulos del Sistema
Dashboard
resumen financiero
ingresos
gastos
balances
gráficos
top gastos
distribución por categorías
Movimientos
ingresos
gastos
editar
eliminar
paginación
filtros
cuentas asociadas
Categorías
crear
editar
eliminar
Cuentas
cuentas bancarias
tarjetas
fechas de corte
fechas de pago
Presupuestos
control por categoría
porcentaje usado
alertas
Ahorros
metas
progreso
porcentaje alcanzado
Perfil
datos del usuario
Asistente IA
chat flotante inteligente
insights automáticos
recomendaciones
🤖 Arquitectura IA
Flujo
Frontend
   ↓
FloatingAssistant.jsx
   ↓
/api/v1/ai/ask
   ↓
financialAgentService.js
   ↓
OpenAI / Gemini / Local AI
🧠 Providers IA
Modo Local

No necesita APIs.

AI_PROVIDER=local
OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxx
Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=xxxx
📦 Colecciones MongoDB
usuarios
{
  usuario_id,
  nombre,
  email,
  ciudad,
  fecha_registro
}
ingresos
{
  ingreso_id,
  usuario_id,
  fuente,
  monto,
  descripcion,
  fecha
}
gastos
{
  gasto_id,
  usuario_id,
  categoria_id,
  cuenta_id,
  monto,
  descripcion,
  fecha
}
categorias
{
  categoria_id,
  nombre
}
cuentas
{
  cuenta_id,
  usuario_id,
  nombre,
  banco,
  tipo,
  saldo,
  fecha_corte,
  fecha_pago,
  activa
}
presupuestos
{
  presupuesto_id,
  usuario_id,
  categoria_id,
  limite,
  mes
}
ahorros
{
  ahorro_id,
  usuario_id,
  meta,
  monto_objetivo,
  monto_actual
}
🔮 Roadmap Futuro
IA
memoria persistente
embeddings
RAG financiero
recomendaciones avanzadas
predicciones financieras
análisis de comportamiento
Automatización
ingresos recurrentes
gastos recurrentes
alertas automáticas
notificaciones inteligentes
Integraciones
Open Banking
WhatsApp
OCR de facturas
voz
Telegram
Analytics
scoring financiero
riesgo financiero
tendencias predictivas
🧠 Filosofía del Proyecto

La aplicación NO busca ser un CRUD financiero tradicional.

El objetivo es crear un:

coach financiero personal
agente inteligente
copiloto financiero
plataforma AI-first

donde toda la experiencia gire alrededor del análisis inteligente de las finanzas del usuario.