import React from 'react';
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import { useGlobalContext } from '../../context/globalContext';
import { dateFormat } from '../../utils/dateFormat';

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Chart() {
  const { incomes, expenses } = useGlobalContext();

  const labels = [
    ...new Set(
      [...incomes, ...expenses].map((item) => dateFormat(item.fecha))
    ),
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: labels.map((label) => {
          const found = incomes.find((inc) => dateFormat(inc.fecha) === label);
          return found ? Number(found.monto) : 0;
        }),
        backgroundColor: 'green',
        tension: 0.2,
      },
      {
        label: 'Gastos',
        data: labels.map((label) => {
          const found = expenses.find((exp) => dateFormat(exp.fecha) === label);
          return found ? Number(found.monto) : 0;
        }),
        backgroundColor: 'red',
        tension: 0.2,
      },
    ],
  };

  return (
    <ChartStyled>
      <Line data={data} />
    </ChartStyled>
  );
}

const ChartStyled = styled.div`
  background: #FCF6F9;
  border: 2px solid #FFFFFF;
  box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  border-radius: 20px;
  height: 100%;
`;

export default Chart;