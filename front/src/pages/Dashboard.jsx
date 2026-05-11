import WelcomeBanner from "../components/WelcomeBanner";
import StatCards from "../components/StatCards";
import CategoryChart from "../components/CategoryChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import RecentTransactions from "../components/RecentTransactions";
import TopExpenses from "../components/TopExpenses";
import UpcomingPayments from "../components/UpcomingPayments";

export default function Dashboard({
  incomes,
  expenses,
  accounts,
  summary,
  categories,
  onOpenIncome,
  onOpenExpense,
}) {
  return (
    <div className="space-y-8 p-8">
      <WelcomeBanner
        onOpenIncome={onOpenIncome}
        onOpenExpense={onOpenExpense}
      />

      <StatCards summary={summary} />

      <div className="grid gap-8 2xl:grid-cols-2">
        <CategoryChart expenses={expenses} categories={categories} />

        <MonthlyTrendChart incomes={incomes} expenses={expenses} />
      </div>

      <RecentTransactions incomes={incomes} expenses={expenses} />

      <div className="grid gap-8 2xl:grid-cols-2">
        <TopExpenses expenses={expenses} />

        <UpcomingPayments accounts={accounts} />
      </div>
    </div>
  );
}