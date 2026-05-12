const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getCategoryName = (categoriaId, categories = []) => {
  const category = categories.find(
    (item) => item.categoria_id === categoriaId
  );

  return category?.nombre || categoriaId || "Sin categoría";
};

export function generateFinancialInsights({
  incomes = [],
  expenses = [],
  categories = [],
  budgets = [],
  savings = [],
}) {
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

  const topCategory = Object.entries(expensesByCategory).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const topExpense = [...expenses].sort(
    (a, b) => Number(b.monto || 0) - Number(a.monto || 0)
  )[0];

  const totalBudget = budgets.reduce(
    (acc, item) => acc + Number(item.limite || 0),
    0
  );

  const totalSavingsGoal = savings.reduce(
    (acc, item) => acc + Number(item.monto_objetivo || 0),
    0
  );

  const totalSaved = savings.reduce(
    (acc, item) => acc + Number(item.monto_actual || 0),
    0
  );

  const insights = [];

  insights.push({
    title: "Balance financiero",
    message:
      balance >= 0
        ? `Tienes un balance positivo de ${formatMoney(balance)}. Vas bien, pero podrías destinar una parte al ahorro.`
        : `Tienes un balance negativo de ${formatMoney(Math.abs(balance))}. Revisa tus gastos más altos este mes.`,
    type: balance >= 0 ? "success" : "danger",
  });

  if (topCategory) {
    insights.push({
      title: "Categoría con mayor gasto",
      message: `Tu mayor gasto está en ${topCategory[0]} con ${formatMoney(
        topCategory[1]
      )}.`,
      type: "warning",
    });
  }

  if (topExpense) {
    insights.push({
      title: "Gasto más alto",
      message: `Tu gasto individual más alto fue "${topExpense.descripcion}" por ${formatMoney(
        topExpense.monto
      )}.`,
      type: "danger",
    });
  }

  if (totalBudget > 0) {
    const percent = (totalExpense / totalBudget) * 100;

    insights.push({
      title: "Uso de presupuesto",
      message: `Has usado el ${percent.toFixed(
        1
      )}% de tu presupuesto total.`,
      type: percent >= 90 ? "danger" : percent >= 70 ? "warning" : "success",
    });
  }

  if (totalSavingsGoal > 0) {
    const progress = (totalSaved / totalSavingsGoal) * 100;

    insights.push({
      title: "Progreso de ahorro",
      message: `Has avanzado ${progress.toFixed(
        1
      )}% hacia tus metas de ahorro.`,
      type: progress >= 70 ? "success" : "warning",
    });
  }

  return insights;
}

export function askFinancialAgent(question, data) {
  const text = question.toLowerCase();

  const {
    incomes = [],
    expenses = [],
    categories = [],
    budgets = [],
    savings = [],
  } = data;

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

  const topCategory = Object.entries(expensesByCategory).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (
    text.includes("gasto más") ||
    text.includes("gastando más") ||
    text.includes("en qué estoy gastando")
  ) {
    if (!topCategory) {
      return "Aún no tienes gastos suficientes para analizar tus categorías.";
    }

    return `Estás gastando más en ${topCategory[0]}, con un total de ${formatMoney(
      topCategory[1]
    )}. Te recomiendo revisar si esa categoría puede reducirse este mes.`;
  }

  if (text.includes("ahorrar") || text.includes("ahorro")) {
    if (balance <= 0) {
      return `Ahora mismo no tienes margen de ahorro porque tus gastos superan o igualan tus ingresos. Te recomiendo reducir gastos variables antes de crear una nueva meta.`;
    }

    const suggested = balance * 0.2;

    return `Podrías ahorrar aproximadamente ${formatMoney(
      suggested
    )} este mes, equivalente al 20% de tu balance disponible.`;
  }

  if (text.includes("presupuesto") || text.includes("excediendo")) {
    if (!budgets.length) {
      return "Todavía no tienes presupuestos registrados. Crea presupuestos por categoría para que pueda detectar excesos automáticamente.";
    }

    const alerts = budgets
      .map((budget) => {
        const spent = expenses
          .filter((expense) => expense.categoria_id === budget.categoria_id)
          .reduce((acc, item) => acc + Number(item.monto || 0), 0);

        const percent = budget.limite > 0 ? (spent / budget.limite) * 100 : 0;

        return {
          category: getCategoryName(budget.categoria_id, categories),
          spent,
          limit: budget.limite,
          percent,
        };
      })
      .filter((item) => item.percent >= 80);

    if (!alerts.length) {
      return "Por ahora no veo presupuestos en riesgo. Tus gastos están dentro de los límites definidos.";
    }

    return `Tienes ${alerts.length} presupuesto(s) en riesgo. El más crítico es ${
      alerts[0].category
    }, con ${alerts[0].percent.toFixed(1)}% usado.`;
  }

  if (text.includes("balance") || text.includes("estado financiero")) {
    return `Tu estado financiero actual es: ingresos ${formatMoney(
      totalIncome
    )}, gastos ${formatMoney(totalExpense)} y balance ${formatMoney(balance)}.`;
  }

  if (text.includes("cuánto puedo gastar") || text.includes("esta semana")) {
    const weekly = balance > 0 ? balance / 4 : 0;

    return `Según tu balance actual, podrías gastar aproximadamente ${formatMoney(
      weekly
    )} por semana sin comprometer tu balance mensual.`;
  }

  if (text.includes("meta") || text.includes("metas")) {
    if (!savings.length) {
      return "Aún no tienes metas de ahorro registradas. Crea una meta para que pueda ayudarte a calcular avances.";
    }

    const totalGoal = savings.reduce(
      (acc, item) => acc + Number(item.monto_objetivo || 0),
      0
    );

    const totalSaved = savings.reduce(
      (acc, item) => acc + Number(item.monto_actual || 0),
      0
    );

    const progress = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

    return `Tus metas de ahorro tienen un avance global de ${progress.toFixed(
      1
    )}%. Has ahorrado ${formatMoney(totalSaved)} de ${formatMoney(totalGoal)}.`;
  }

  return "Puedo ayudarte a analizar gastos, ingresos, presupuestos, balance y metas de ahorro. Prueba preguntarme: ¿En qué estoy gastando más?";
}