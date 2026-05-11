import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layout';
import { dollar } from '../../utils/icons';
import Chart from '../Chart/Chart';
import History from '../../History/History';

function Dashboard() {
  const {
    totalExpense,
    incomes,
    expenses,
    totalIncome,
    totalBalance,
    getIncomes,
    getExpenses,
    financialStatus,
    getFinancialStatus,
  } = useGlobalContext();

  useEffect(() => {
    getIncomes();
    getExpenses();
    getFinancialStatus("U001", "Febrero");
  }, []);

  const minIncome = incomes.length ? Math.min(...incomes.map(item => Number(item.monto || 0))) : 0;
  const maxIncome = incomes.length ? Math.max(...incomes.map(item => Number(item.monto || 0))) : 0;
  const minExpense = expenses.length ? Math.min(...expenses.map(item => Number(item.monto || 0))) : 0;
  const maxExpense = expenses.length ? Math.max(...expenses.map(item => Number(item.monto || 0))) : 0;

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'saludable':
        return '#27ae60';
      case 'estable':
        return '#2980b9';
      case 'en_riesgo':
        return '#f39c12';
      case 'critico':
        return '#c0392b';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <DashboardStyled>
      <InnerLayout>
        <h1>Todas las transacciones</h1>

        {financialStatus && (
          <div className="financial-status-card">
            <h2>Estado financiero</h2>
            <div
              className="status-badge"
              style={{ background: getStatusColor(financialStatus.estado) }}
            >
              {financialStatus.estado}
            </div>
            <p>{financialStatus.mensaje}</p>

            <div className="status-grid">
              <div>
                <span>Ingresos</span>
                <strong>${financialStatus.total_ingresos}</strong>
              </div>
              <div>
                <span>Gastos</span>
                <strong>${financialStatus.total_gastos}</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong>${financialStatus.balance}</strong>
              </div>
              <div>
                <span>Tasa de ahorro</span>
                <strong>{financialStatus.tasa_ahorro}%</strong>
              </div>
              <div>
                <span>Presupuestos excedidos</span>
                <strong>{financialStatus.presupuestos_excedidos}</strong>
              </div>
              <div>
                <span>Cerca del límite</span>
                <strong>{financialStatus.presupuestos_cerca_limite}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="stats-con">
          <div className="chart-con">
            <Chart />
            <div className="amount-con">
              <div className="income">
                <h2>Total de ingresos</h2>
                <p>{dollar} {totalIncome()}</p>
              </div>
              <div className="expense">
                <h2>Total de gastos</h2>
                <p>{dollar} {totalExpense()}</p>
              </div>
              <div className="balance">
                <h2>Balance total</h2>
                <p>{dollar} {totalBalance()}</p>
              </div>
            </div>
          </div>

          <div className="history-con">
            <History />
            <h2 className="salary-title">Min <span>Income</span> Max</h2>
            <div className="salary-item">
              <p>${minIncome}</p>
              <p>${maxIncome}</p>
            </div>

            <h2 className="salary-title">Min <span>Expense</span> Max</h2>
            <div className="salary-item">
              <p>${minExpense}</p>
              <p>${maxExpense}</p>
            </div>
          </div>
        </div>
      </InnerLayout>
    </DashboardStyled>
  );
}

const DashboardStyled = styled.div`
  .financial-status-card {
    background: #FCF6F9;
    border: 2px solid #FFFFFF;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;

    h2 {
      margin-bottom: 1rem;
      color: #222260;
    }

    .status-badge {
      display: inline-block;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    p {
      color: rgba(34, 34, 96, 0.8);
      margin-bottom: 1rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;

      div {
        background: white;
        border-radius: 14px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        span {
          font-size: 0.9rem;
          color: rgba(34, 34, 96, 0.7);
        }

        strong {
          font-size: 1.2rem;
          color: #222260;
        }
      }
    }
  }

  .stats-con{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2rem;

    .chart-con{
      grid-column: 1 / 4;
      height: 400px;

      .amount-con{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
        margin-top: 2rem;

        .income, .expense{
          grid-column: span 2;
        }

        .income, .expense, .balance{
          background: #FCF6F9;
          border: 2px solid #FFFFFF;
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          border-radius: 20px;
          padding: 1rem;

          p{
            font-size: 3.5rem;
            font-weight: 700;
          }
        }

        .balance{
          grid-column: 2 / 4;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          p{
            color: var(--color-green);
            opacity: 0.6;
            font-size: 4.5rem;
          }
        }
      }
    }

    .history-con{
      grid-column: 4 / -1;

      h2{
        margin: 1rem 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .salary-title{
        font-size: 1.2rem;

        span{
          font-size: 1.8rem;
        }
      }

      .salary-item{
        background: #FCF6F9;
        border: 2px solid #FFFFFF;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        padding: 1rem;
        border-radius: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        p{
          font-weight: 600;
          font-size: 1.6rem;
        }
      }
    }
  }
`;

export default Dashboard;