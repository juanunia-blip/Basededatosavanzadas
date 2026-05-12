const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getCategoryName = (categoriaId, categories = []) => {
  const category = categories.find(
    (item) => item.categoria_id === categoriaId
  );

  return category?.nombre || categoriaId || "Sin categoría";
};

const buildFinancialSummary = ({
  incomes = [],
  expenses = [],
  categories = [],
  budgets = [],
  savings = [],
  accounts = [],
}) => {
  const totalIncome = incomes.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  const totalExpense = expenses.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  const balance = totalIncome - totalExpense;

  const expensesByCategory = expenses.reduce((acc, item) => {
    const name = getCategoryName(item.categoria_id, categories);
    acc[name] = (acc[name] || 0) + Number(item.monto || 0);
    return acc;
  }, {});

  const topExpenses = [...expenses]
    .sort((a, b) => Number(b.monto || 0) - Number(a.monto || 0))
    .slice(0, 5)
    .map((item) => ({
      descripcion: item.descripcion,
      monto: item.monto,
      categoria: getCategoryName(item.categoria_id, categories),
      cuenta_id: item.cuenta_id || null,
      fecha: item.fecha,
    }));

  return {
    totalIncome,
    totalExpense,
    balance,
    formatted: {
      totalIncome: formatMoney(totalIncome),
      totalExpense: formatMoney(totalExpense),
      balance: formatMoney(balance),
    },
    expensesByCategory,
    topExpenses,
    budgets,
    savings,
    accounts,
  };
};

const localAnswer = (question, data) => {
  const text = question.toLowerCase();
  const summary = buildFinancialSummary(data);

  const topCategory = Object.entries(summary.expensesByCategory).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (
    text.includes("gasto más") ||
    text.includes("gastando más") ||
    text.includes("en qué")
  ) {
    if (!topCategory) {
      return "Aún no tienes suficientes gastos para detectar una categoría principal.";
    }

    return `Estás gastando más en ${topCategory[0]}, con un total de ${formatMoney(
      topCategory[1]
    )}. Revisa si puedes reducir esa categoría este mes.`;
  }

  if (text.includes("ahorrar") || text.includes("ahorro")) {
    if (summary.balance <= 0) {
      return `Tu balance actual es ${summary.formatted.balance}. Antes de ahorrar, deberías reducir gastos variables o revisar tus gastos más altos.`;
    }

    return `Tu balance actual es ${summary.formatted.balance}. Una meta razonable sería ahorrar el 20%, aproximadamente ${formatMoney(
      summary.balance * 0.2
    )}.`;
  }

  if (text.includes("presupuesto") || text.includes("excediendo")) {
    if (!data.budgets.length) {
      return "No tienes presupuestos registrados. Crea presupuestos por categoría para detectar excesos automáticamente.";
    }

    const alerts = data.budgets
      .map((budget) => {
        const spent = data.expenses
          .filter((expense) => expense.categoria_id === budget.categoria_id)
          .reduce((acc, item) => acc + Number(item.monto || 0), 0);

        const percent = budget.limite > 0 ? (spent / budget.limite) * 100 : 0;

        return {
          category: getCategoryName(budget.categoria_id, data.categories),
          percent,
        };
      })
      .filter((item) => item.percent >= 80);

    if (!alerts.length) {
      return "No veo presupuestos en riesgo. Tus gastos están dentro de los límites definidos.";
    }

    return `Tienes ${alerts.length} presupuesto(s) en riesgo. El más crítico es ${
      alerts[0].category
    } con ${alerts[0].percent.toFixed(1)}% usado.`;
  }

  if (text.includes("balance") || text.includes("estado")) {
    return `Tu estado financiero actual: ingresos ${summary.formatted.totalIncome}, gastos ${summary.formatted.totalExpense}, balance ${summary.formatted.balance}.`;
  }

  return `Puedo ayudarte a analizar gastos, ingresos, presupuestos, cuentas y metas. Tu balance actual es ${summary.formatted.balance}.`;
};

const buildPrompt = (question, financialData, history = []) => {
  const summary = buildFinancialSummary(financialData);

  return `
Eres un agente financiero personal dentro de una app de control de gastos.
Responde en español, de forma clara, accionable y prudente.
No inventes datos. Usa solo la información financiera enviada.
No des asesoría financiera profesional ni promesas de inversión.
Tu objetivo es analizar hábitos, detectar patrones, alertar excesos y sugerir ahorro.

Pregunta del usuario:
${question}

Historial reciente de conversación:
${JSON.stringify(history.slice(-8), null, 2)}

Resumen financiero:
${JSON.stringify(summary, null, 2)}

Datos completos:
${JSON.stringify(
  {
    incomes: financialData.incomes,
    expenses: financialData.expenses,
    categories: financialData.categories,
    budgets: financialData.budgets,
    savings: financialData.savings,
    accounts: financialData.accounts,
  },
  null,
  2
)}
`;
};

const askOpenAI = async ({ question, financialData, history }) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: buildPrompt(question, financialData, history),
  });

  return response.output_text;
};

const askGemini = async ({ question, financialData, history }) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: buildPrompt(question, financialData, history),
  });

  return response.text;
};

const askFinancialAgent = async ({ question, financialData, history = [] }) => {
  const provider = process.env.AI_PROVIDER || "local";

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return askOpenAI({ question, financialData, history });
  }

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    return askGemini({ question, financialData, history });
  }

  return localAnswer(question, financialData);
};

module.exports = {
  askFinancialAgent,
  buildFinancialSummary,
};