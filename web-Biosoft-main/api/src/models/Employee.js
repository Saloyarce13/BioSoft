// src/models/Employee.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/*
  Tabla: employees
  Columnas: id, fullName, email, phone, documentType, documentNumber, address, birthDate, position, salary, hireDate, password, isActive, createdAt, updatedAt
  Relación: un empleado puede estar en muchas compras (1:N) y muchas ventas (1:N)
*/
const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre completo del empleado no puede estar vacío' },
      len: { args: [2, 120], msg: 'El nombre debe tener entre 2 y 120 caracteres' }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: {
      name: 'unique_employee_email',
      msg: 'Este email ya está registrado como empleado'
    },
    validate: {
      isEmail: { msg: 'Debe ser un email válido' }
    }
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
    validate: {
      len: { args: [7, 30], msg: 'El teléfono debe tener entre 7 y 30 caracteres' }
    }
  },
  documentType: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      len: { args: [2, 10], msg: 'El tipo de documento debe tener entre 2 y 10 caracteres' }
    }
  },
  documentNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: {
      name: 'unique_employee_document',
      msg: 'Este número de documento ya está registrado'
    },
    validate: {
      len: { args: [8, 20], msg: 'El número de documento debe tener entre 8 y 20 caracteres' }
    }
  },
  address: {
    type: DataTypes.STRING(250),
    allowNull: true,
    validate: {
      len: { args: [5, 250], msg: 'La dirección debe tener entre 5 y 250 caracteres' }
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'La fecha de nacimiento debe ser una fecha válida' }
    }
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: { args: [2, 50], msg: 'El cargo debe tener entre 2 y 50 caracteres' }
    }
  },
  salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      isDecimal: { msg: 'El salario debe ser un número válido' },
      min: { args: [0], msg: 'El salario no puede ser negativo' }
    }
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'La fecha de ingreso debe ser una fecha válida' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [60, 255], msg: 'La contraseña debe estar hasheada' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Sirve para desactivar empleados sin eliminarlos'
  }
}, {
  tableName: 'employees',
  timestamps: true
});

module.exports = Employee;
