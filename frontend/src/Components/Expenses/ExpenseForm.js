import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus } from '../../utils/icons';

const ExpenseForm = () => {
  const { addExpense, error } = useGlobalContext();

  const [inputState, setInputState] = useState({
    gasto_id: '',
    usuario_id: '',
    categoria_id: '',
    monto: '',
    descripcion: '',
    fecha: '',
  });

  const { gasto_id, usuario_id, categoria_id, monto, descripcion, fecha } = inputState;

  const handleInput = (name) => (e) => {
    setInputState({ ...inputState, [name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addExpense({
      gasto_id,
      usuario_id,
      categoria_id,
      monto: Number(monto),
      descripcion,
      fecha,
    });

    setInputState({
      gasto_id: '',
      usuario_id: '',
      categoria_id: '',
      monto: '',
      descripcion: '',
      fecha: '',
    });
  };

  return (
    <ExpenseFormStyled onSubmit={handleSubmit}>
      {error && <p className='error'>{error}</p>}

      <div className="input-control">
        <input
          type='text'
          value={gasto_id}
          name='gasto_id'
          placeholder='ID del gasto'
          onChange={handleInput('gasto_id')}
        />
      </div>

      <div className="input-control">
        <input
          type='text'
          value={usuario_id}
          name='usuario_id'
          placeholder='ID del usuario'
          onChange={handleInput('usuario_id')}
        />
      </div>

      <div className="selects input-controls">
        <select
          required
          value={categoria_id}
          name='categoria_id'
          id='categoria_id'
          onChange={handleInput('categoria_id')}
        >
          <option value="" disabled>Selecciona categoría</option>
          <option value="C001">Alimentacion</option>
          <option value="C002">Transporte</option>
          <option value="C003">Entretenimiento</option>
          <option value="C004">Salud</option>
          <option value="C005">Educacion</option>
          <option value="C006">Servicios</option>
          <option value="C007">Arriendo</option>
        </select>
      </div>

      <div className="input-control">
        <input
          value={monto}
          type='number'
          name='monto'
          placeholder='Monto del gasto'
          onChange={handleInput('monto')}
        />
      </div>

      <div className="input-control">
        <DatePicker
          id='fecha'
          placeholderText='Ingresa fecha'
          selected={fecha}
          dateFormat='dd/MM/yyyy'
          onChange={(date) => {
            setInputState({ ...inputState, fecha: date });
          }}
        />
      </div>

      <div className="input-control">
        <textarea
          name='descripcion'
          value={descripcion}
          placeholder='Descripción'
          id='descripcion'
          cols='30'
          rows='4'
          onChange={handleInput('descripcion')}
        />
      </div>

      <div className="submit-btn">
        <Button
          name={'Agregar Gasto'}
          icon={plus}
          bPad={'.8rem 1.6rem'}
          bRad={'30px'}
          bg={'var(--color-accent)'}
          color={'#fff'}
        />
      </div>
    </ExpenseFormStyled>
  );
};

const ExpenseFormStyled = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  input, textarea, select{
    font-family: inherit;
    font-size: inherit;
    outline: none;
    border: none;
    padding: .5rem 1rem;
    border-radius: 5px;
    border: 2px solid #fff;
    background: transparent;
    resize: none;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    color: rgba(34, 34, 96, 0.9);

    &::placeholder{
      color: rgba(34, 34, 96, 0.4);
    }
  }

  .input-control{
    input{
      width: 100%;
    }
  }

  .selects{
    display: flex;
    justify-content: flex-end;

    select{
      color: rgba(34, 34, 96, 0.4);

      &:focus, &:active{
        color: rgba(34, 34, 96, 1);
      }
    }
  }

  .submit-btn{
    button{
      box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);

      &:hover{
        background: var(--color-green) !important;
      }
    }
  }
`;

export default ExpenseForm;