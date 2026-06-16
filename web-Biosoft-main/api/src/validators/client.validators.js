// src/validators/client.validators.js

const { z } = require('zod');

const DOC_NUMBER_REGEX = /^\d{8,20}$/;
const PHONE_REGEX = /^\+?\d{7,30}$/;

const createClientSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),
  email: z
    .string()
    .email('El email no es válido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(30, 'El teléfono no puede exceder 30 caracteres')
    .regex(PHONE_REGEX, 'El teléfono solo debe contener números')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(250, 'La dirección no puede exceder 250 caracteres')
    .optional()
    .or(z.literal('')),
  documentType: z
    .string()
    .max(10, 'El tipo de documento no puede exceder 10 caracteres')
    .optional()
    .or(z.literal('')),
  documentNumber: z
    .string()
    .regex(DOC_NUMBER_REGEX, 'El número de documento solo debe contener dígitos (8-20)')
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true)
});

const updateClientSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email('El email no es válido')
    .max(150, 'El email no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(30, 'El teléfono no puede exceder 30 caracteres')
    .regex(PHONE_REGEX, 'El teléfono solo debe contener números')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(250, 'La dirección no puede exceder 250 caracteres')
    .optional()
    .or(z.literal('')),
  documentType: z
    .string()
    .max(10, 'El tipo de documento no puede exceder 10 caracteres')
    .optional()
    .or(z.literal('')),
  documentNumber: z
    .string()
    .regex(DOC_NUMBER_REGEX, 'El número de documento solo debe contener dígitos (8-20)')
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional()
});

module.exports = {
  createClientSchema,
  updateClientSchema
};
