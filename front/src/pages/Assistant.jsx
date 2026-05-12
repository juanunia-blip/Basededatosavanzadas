import { useMemo, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import {
  askFinancialAgent,
  generateFinancialInsights,
} from "../utils/financialAgent";

const quickQuestions = [
  "¿En qué estoy gastando más?",
  "¿Cómo puedo ahorrar este mes?",
  "¿Estoy excediendo mi presupuesto?",
  "¿Cuál es mi estado financiero?",
  "¿Cuánto puedo gastar esta semana?",
  "¿Cómo van mis metas de ahorro?",
];

export default function Assistant({
  incomes = [],
  expenses = [],
  categories = [],
  budgets = [],
  savings = [],
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hola, soy tu agente financiero inteligente. Puedo analizar tus ingresos, gastos, presupuestos y metas de ahorro para darte recomendaciones personalizadas.",
    },
  ]);

  const insights = useMemo(
    () =>
      generateFinancialInsights({
        incomes,
        expenses,
        categories,
        budgets,
        savings,
      }),
    [incomes, expenses, categories, budgets, savings]
  );

  const agentData = {
    incomes,
    expenses,
    categories,
    budgets,
    savings,
  };

  const handleAsk = (customQuestion) => {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim()) return;

    const answer = askFinancialAgent(finalQuestion, agentData);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: finalQuestion,
      },
      {
        role: "assistant",
        text: answer,
      },
    ]);

    setQuestion("");
  };

  const getInsightIcon = (type) => {
    if (type === "danger") return AlertTriangle;
    if (type === "success") return CheckCircle2;
    return TrendingUp;
  };

  const getInsightStyle = (type) => {
    if (type === "danger") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (type === "success") {
      return "bg-green-50 text-green-700 border-green-100";
    }

    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white">
              <Bot size={26} />
            </div>

            <h1 className="text-4xl font-bold text-slate-950">
              Agente Financiero IA
            </h1>
          </div>

          <p className="text-slate-500">
            Analiza tus finanzas, detecta patrones y recibe recomendaciones
            inteligentes.
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          Modo local gratuito
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-3">
        {insights.slice(0, 3).map((insight) => {
          const Icon = getInsightIcon(insight.type);

          return (
            <article
              key={insight.title}
              className={`rounded-2xl border p-6 shadow-sm ${getInsightStyle(
                insight.type
              )}`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <Icon size={24} />
              </div>

              <h2 className="text-lg font-bold">{insight.title}</h2>

              <p className="mt-2 text-sm leading-6">{insight.message}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="text-blue-700" size={24} />
            <h2 className="text-2xl font-bold text-slate-950">
              Chat financiero
            </h2>
          </div>

          <div className="mb-6 h-[460px] space-y-4 overflow-y-auto rounded-2xl bg-slate-100 p-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-blue-700 text-white"
                      : "bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
              placeholder="Pregúntame sobre tus finanzas..."
              className="flex-1 rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-blue-600"
            />

            <button
              onClick={() => handleAsk()}
              className="flex items-center gap-2 rounded-2xl bg-blue-700 px-6 py-4 font-semibold text-white hover:bg-blue-800"
            >
              <Send size={20} />
              Enviar
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Preguntas rápidas
            </h2>

            <div className="mt-5 space-y-3">
              {quickQuestions.map((item) => (
                <button
                  key={item}
                  onClick={() => handleAsk(item)}
                  className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Insights automáticos
            </h2>

            <div className="mt-5 space-y-4">
              {insights.map((insight) => {
                const Icon = getInsightIcon(insight.type);

                return (
                  <div
                    key={insight.title}
                    className={`rounded-2xl border p-4 ${getInsightStyle(
                      insight.type
                    )}`}
                  >
                    <div className="mb-2 flex items-center gap-2 font-bold">
                      <Icon size={18} />
                      {insight.title}
                    </div>

                    <p className="text-sm leading-6">{insight.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}