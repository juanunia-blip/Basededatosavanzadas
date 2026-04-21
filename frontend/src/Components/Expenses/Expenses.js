import React, { useEffect } from 'react';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layout';
import { useGlobalContext } from '../../context/globalContext';
import IncomeItem from '../IncomeItem/IncomeItem';
import ExpenseForm from './ExpenseForm';

function Expenses() {
  const { expenses, getExpenses, deleteExpense, totalExpense } = useGlobalContext();

  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <ExpenseStyled>
      <InnerLayout>
        <h1>Gastos</h1>
        <h2 className='total-income'>
          Total Gastos : <span>${totalExpense()}</span>
        </h2>

        <div className="income-content">
          <div className="form-container">
            <ExpenseForm />
          </div>

          <div className="incomes">
            {expenses.map((expense) => {
              const { _id, descripcion, monto, fecha, categoria_id } = expense;

              return (
                <IncomeItem
                  key={_id}
                  id={_id}
                  title={descripcion}
                  description={descripcion}
                  amount={monto}
                  date={fecha}
                  type="expense"
                  category={categoria_id}
                  indicatorColor="red"
                  deleteItem={deleteExpense}
                />
              );
            })}
          </div>
        </div>
      </InnerLayout>
    </ExpenseStyled>
  );
}

const ExpenseStyled = styled.div`
  display: flex;
  overflow: auto;

  .total-income{
    display: flex;
    justify-content: center;
    align-items: center;
    background: #FCF6F9;
    border: 2px solid #FFFFFF;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 1rem;
    margin: 1rem 0;
    font-size: 2rem;
    gap: .5rem;

    span{
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--color-green);
    }
  }

  .income-content{
    display:flex;
    gap:2rem;

    .incomes{
      flex:1;
    }
  }
`;

export default Expenses;