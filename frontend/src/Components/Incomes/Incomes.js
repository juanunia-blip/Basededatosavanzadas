import React, { useEffect } from 'react';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layout';
import { useGlobalContext } from '../../context/globalContext';
import Form from '../Form/Form';
import IncomeItem from '../IncomeItem/IncomeItem';

function Incomes() {
  const {
    incomes,
    getIncomes,
    deleteIncome,
    totalIncome,
    setEditingIncome
  } = useGlobalContext();

  useEffect(() => {
    getIncomes();
  }, []);

  return (
    <IncomesStyled>
      <InnerLayout>
        <h1>Ingresos</h1>

        <h2 className='total-income'>
          Ingresos totales: <span>$ {totalIncome()}</span>
        </h2>

        <div className="income-content">
          <div className="form-container">
            <Form />
          </div>

          <div className="incomes">
            {incomes.map((income) => {
              const { _id, descripcion, monto, fecha, fuente, ingreso_id, usuario_id } = income;

              return (
                <IncomeItem
                  key={_id}
                  id={_id}
                  title={fuente}
                  description={descripcion}
                  amount={monto}
                  date={fecha}
                  type="income"
                  category={fuente}
                  indicatorColor="var(--color-green)"
                  deleteItem={deleteIncome}
                  editItem={() => setEditingIncome({
                    _id,
                    ingreso_id,
                    usuario_id,
                    fuente,
                    monto,
                    descripcion,
                    fecha
                  })}
                />
              );
            })}
          </div>
        </div>
      </InnerLayout>
    </IncomesStyled>
  );
}

const IncomesStyled = styled.div`
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

    .form-container{
      flex: 0 0 420px;
    }

    .incomes{
      flex:1;
    }
  }
`;

export default Incomes;