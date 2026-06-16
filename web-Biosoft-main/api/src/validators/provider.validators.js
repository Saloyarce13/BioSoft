// src/validators/provider.validators.js

const { z } = require('zod');

const PHONE_REGEX = /^\+?\d{7,30}$/;

const createProviderSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),
  businessName: z
    .string()
    .max(200, 'La razón social no puede exceder 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  documentType: z
    .string()
    .max(10, 'El tipo de documento no puede exceder 10 caracteres')
    .optional()
    .or(z.literal('')),
  documentNumber: z
    .string()
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  contactPerson: z
    .string()
    .max(150, 'El contacto no puede exceder 150 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
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
  website: z
    .string()
    .max(500, 'El sitio web no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true)
});

const updateProviderSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim()
    .optional(),
  businessName: z
    .string()
    .max(200, 'La razón social no puede exceder 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  documentType: z
    .string()
    .max(10, 'El tipo de documento no puede exceder 10 caracteres')
    .optional()
    .or(z.literal('')),
  documentNumber: z
    .string()
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  contactPerson: z
    .string()
    .max(150, 'El contacto no puede exceder 150 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
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
  website: z
    .string()
    .max(500, 'El sitio web no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional()
});

module.exports = {
  createProviderSchema,
  updateProviderSchema
};
