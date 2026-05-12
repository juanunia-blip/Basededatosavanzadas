import { useMemo, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  askFinancialAgent,
  generateFinancialInsights,
} from "../utils/financialAgent";

const quickQuestions = [
  "¿En qué estoy gastando más?",
  "¿Cómo puedo ahorrar este mes?",
  "¿Estoy excediendo mi presupuesto?",
  "¿Cuál es mi balance?",
];

export default function FloatingAssistant({
  incomes = [],
  expenses = [],
  categories = [],
  budgets = [],
  savings = [],
}) {
  const [open, setOpen] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        text: "Hola 👋 Soy tu asistente financiero inteligente. Pregúntame sobre gastos, presupuestos, ahorro o hábitos financieros.",
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
    [
      incomes,
      expenses,
      categories,
      budgets,
      savings,
    ]
  );

  const agentData = {
    incomes,
    expenses,
    categories,
    budgets,
    savings,
  };

  const handleAsk = (
    customQuestion
  ) => {
    const finalQuestion =
      customQuestion || question;

    if (!finalQuestion.trim())
      return;

    const answer =
      askFinancialAgent(
        finalQuestion,
        agentData
      );

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

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-white shadow-2xl transition hover:scale-105 hover:bg-blue-800"
        >
          <Bot size={30} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[720px] w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-blue-700 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <Bot size={24} />
              </div>

              <div>
                <h2 className="font-bold">
                  Agente Financiero IA
                </h2>

                <p className="text-sm text-blue-100">
                  Analizando tus finanzas
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setOpen(false)
              }
              className="rounded-xl p-2 hover:bg-white/10"
            >
              <X size={22} />
            </button>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles
                className="text-blue-700"
                size={18}
              />

              <span className="text-sm font-bold text-slate-700">
                Insights rápidos
              </span>
            </div>

            <div className="space-y-2">
              {insights
                .slice(0, 2)
                .map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl bg-white p-3 text-sm shadow-sm"
                  >
                    <strong className="block text-slate-950">
                      {item.title}
                    </strong>

                    <p className="mt-1 text-slate-600">
                      {item.message}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-100 p-5">
            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-6 ${
                      message.role ===
                      "user"
                        ? "bg-blue-700 text-white"
                        : "bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickQuestions.map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      handleAsk(item)
                    }
                    className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    handleAsk();
                  }
                }}
                placeholder="Pregunta sobre tus finanzas..."
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />

              <button
                onClick={() =>
                  handleAsk()
                }
                className="flex items-center justify-center rounded-2xl bg-blue-700 px-5 text-white hover:bg-blue-800"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}