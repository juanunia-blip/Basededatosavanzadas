module.exports = {
  ...require("./business.controller"),
  ...require("./workers.controller"),
  ...require("./productions.controller"),
  ...require("./settlements.controller"),
  ...require("./expenses.controller"),
  ...require("./sales.controller"),
  ...require("./summary.controller"),
  ...require("./reports.controller"),
};
