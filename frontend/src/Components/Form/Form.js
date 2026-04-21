import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus } from '../../utils/icons';

const Form = () => {
  const {
    addIncome,
    updateIncome,
    editingIncome,
    setEditingIncome,
    error
  } = useGlobalContext();

  const initialState = {
    ingreso_id: '',
    usuario_id: 'U001',
    fuente: '',
    monto: '',
    descripcion: '',
    fecha: null,
  };

  const [inputState, setInputState] = useState(initialState);

  useEffect(() => {
    if (editingIncome) {
      setInputState({
        ingreso_id: editingIncome.ingreso_id || '',
        usuario_id: editingIncome.usuario_id || 'U001',
        fuente: editingIncome.fuente || '',
        monto: editingIncome.monto || '',
        descripcion: editingIncome.descripcion || '',
        fecha: editingIncome.fecha ? new Date(editingIncome.fecha) : null,
      });
    } else {
      setInputState(initialState);
    }
  }, [editingIncome]);

  const { ingreso_id, usuario_id, fuente, monto, descripcion, fecha } = inputState;

  const handleInput = (name) => (e) => {
    setInputState({ ...inputState, [name]: e.target.value });
  };

  const resetForm = () => {
    setInputState(initialState);
    setEditingIncome(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ingreso_id,
      usuario_id,
      fuente,
      monto: Number(monto),
      descripcion,
      fecha,
    };

    if (editingIncome?._id) {
      await updateIncome(editingIncome._id, payload);
    } else {
      await addIncome(payload);
    }

    resetForm();
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      {error && <p className='error'>{error}</p>}

      <div className="input-control">
        <input
          type='text'
          value={ingreso_id}
          name='ingreso_id'
          placeholder='ID del ingreso'
          onChange={handleInput('ingreso_id')}
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
          value={fuente}
          name='fuente'
          id='fuente'
          onChange={handleInput('fuente')}
        >
          <option value="" disabled>Selecciona fuente</option>
          <option value="Salario">Salario</option>
          <option value="Freelance">Freelance</option>
          <option value="Ventas">Ventas</option>
          <option value="Inversion">Inversion</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="input-control">
        <input
          value={monto}
          type='number'
          name='monto'
          placeholder='Monto del ingreso'
          onChange={handleInput('monto')}
        />
      </div>

      <div className="input-control">
        <DatePicker
          id='fecha'
          placeholderText='Ingresa fecha'
          selected={fecha}
          dateFormat='dd/MM/yyyy'
          onChange={(dateValue) => {
            setInputState({ ...inputState, fecha: dateValue });
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

      <div className="submit-btn actions">
        <Button
          name={editingIncome ? 'Actualizar Ingreso' : 'Agregar Ingreso'}
          icon={plus}
          bPad={'.8rem 1.6rem'}
          bRad={'30px'}
          bg={'var(--color-accent)'}
          color={'#fff'}
        />

        {editingIncome && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancelar edición
          </button>
        )}
      </div>
    </FormStyled>
  );
};

const FormStyled = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  input, textarea, select{
    font-family: inherit;
    font-size: inherit;
    outline: none;
    border: none;
    padding: .8rem 1rem;
    border-radius: 10px;
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
      width: 100%;
      color: rgba(34, 34, 96, 0.4);

      &:focus, &:active{
        color: rgba(34, 34, 96, 1);
      }
    }
  }

  .actions{
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .cancel-btn{
    border: none;
    padding: .8rem 1.2rem;
    border-radius: 30px;
    cursor: pointer;
    background: #ddd;
    color: #222260;
  }

  .submit-btn{
    button{
      box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);

      &:hover{
        background: var(--color-green) !important;
      }
    }
  }

  .error{
    color: red;
    font-weight: 600;
  }
`;

export default Form;