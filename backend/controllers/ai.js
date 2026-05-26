const Ingreso = require("../models/IncomeModel");
const Gasto = require("../models/ExpenseModel");
const Categoria = require("../models/CategoryModel");
const Cuenta = require("../models/AccountModel");
const Presupuesto = require("../models/BudgetModel");
const Ahorro = require("../models/SavingModel");

const {
  askFinancialAgent,
  buildFinancialSummary,
} = require("../services/financialAgentService");

const getFinancialData = async (usuario_id) => {
  const [
    incomes,
    expenses,
    categories,
    accounts,
    budgets,
    savings,
  ] = await Promise.all([
    Ingreso.find({ usuario_id }).sort({ fecha: -1 }).lean(),
    Gasto.find({ usuario_id }).sort({ fecha: -1 }).lean(),
    Categoria.find({ usuario_id }).lean(),
    Cuenta.find({ usuario_id }).lean(),
    Presupuesto.find({ usuario_id }).lean(),
    Ahorro.find({ usuario_id }).lean(),
  ]);

  return {
    incomes,
    expenses,
    categories,
    accounts,
    budgets,
    savings,
  };
};

const askAI = async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!req.usuario?.usuario_id) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    if (!question) {
      return res.status(400).json({
        message: "La pregunta es obligatoria",
      });
    }

    const usuario_id = req.usuario.usuario_id;

    const financialData = await getFinancialData(usuario_id);

    const answer = await askFinancialAgent({
      question,
      financialData,
      history,
      usuario_id,
    });

    res.status(200).json({
      provider: process.env.AI_PROVIDER || "local",
      usuario_id,
      answer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error consultando agente financiero",
      error: error.message,
    });
  }
};

const getAIInsights = async (req, res) => {
  try {
    if (!req.usuario?.usuario_id) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const usuario_id = req.usuario.usuario_id;

    const financialData = await getFinancialData(usuario_id);
    const summary = buildFinancialSummary(financialData);

    const insights = [];

    insights.push({
      title: "Balance financiero",
      type: summary.balance >= 0 ? "success" : "danger",
      message:
        summary.balance >= 0
          ? `Tienes un balance positivo de ${summary.formatted.balance}.`
          : `Tienes un balance negativo de ${summary.formatted.balance}.`,
    });

    const topCategory = Object.entries(summary.expensesByCategory || {}).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topCategory) {
      insights.push({
        title: "Mayor categoría de gasto",
        type: "warning",
        message: `Tu mayor gasto está en ${topCategory[0]} con ${new Intl.NumberFormat(
          "es-CO",
          {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }
        ).format(topCategory[1])}.`,
      });
    }

    res.status(200).json({
      usuario_id,
      summary,
      insights,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generando insights",
      error: error.message,
    });
  }
};

module.exports = {
  askAI,
  getAIInsights,
};