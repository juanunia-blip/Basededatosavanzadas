import React from 'react';
import styled from 'styled-components';
import { useGlobalContext } from '../context/globalContext';

function History() {
  const { transactionHistory } = useGlobalContext();

  const history = transactionHistory();

  return (
    <HistoryStyled>
      <h2>Historial reciente</h2>
      {history.map((item) => {
        const { _id, descripcion, monto, gasto_id, ingreso_id } = item;
        const isExpense = !!gasto_id;

        return (
          <div key={_id} className="history-item">
            <p
              style={{
                color: isExpense ? 'red' : 'var(--color-green)',
              }}
            >
              {descripcion}
            </p>

            <p
              style={{
                color: isExpense ? 'red' : 'var(--color-green)',
              }}
            >
              {isExpense
                ? `-${monto <= 0 ? 0 : monto}`
                : `+${monto <= 0 ? 0 : monto}`}
            </p>
          </div>
        );
      })}
    </HistoryStyled>
  );
}

const HistoryStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .history-item {
    background: #FCF6F9;
    border: 2px solid #FFFFFF;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    padding: 1rem;
    border-radius: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export default History;