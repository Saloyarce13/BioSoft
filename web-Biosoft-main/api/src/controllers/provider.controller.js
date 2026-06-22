const { z } = require('zod');
const prisma = require('../lib/prisma');
const { validate } = require('../lib/validate');

// Regex de validaciones
// PAS: alfanumérico 8-15. Otros: solo dígitos 8-20. Proveedores NIT pueden tener guión.
const DOC_NUMBER_REGEX_PASSPORT = /^[A-Za-z0-9]{8,15}$/;
const DOC_NUMBER_REGEX_NUMERIC  = /^[\d\-]{1,20}$/;
const PHONE_REGEX      = /^\+?\d{7,30}$/;
const VALID_DOC_TYPES  = ['NIT', 'CC', 'CE', 'PAS', 'RUT'];

function validateProviderDoc(docType, docNumber) {
  if (!docNumber) return true;
  if (docType === 'PAS') return DOC_NUMBER_REGEX_PASSPORT.test(docNumber);
  return DOC_NUMBER_REGEX_NUMERIC.test(docNumber);
}

const createProviderSchema = z.object({
  name:           z.string().min(2).max(150),
  businessName:   z.string().max(200).optional().nullable(),
  documentType:   z.enum(VALID_DOC_TYPES, { message: 'Tipo de documento inválido' }).optional().nullable(),
  documentNumber: z.string().max(20).optional().nullable(),
  contactPerson:  z.string().max(150).optional().nullable(),
  email:          z.string().email('Email inválido').max(150).optional().nullable(),
  phone:          z.string().regex(PHONE_REGEX, 'El teléfono debe tener entre 7 y 30 dígitos (puede incluir +)').max(30).optional().nullable(),
  address:        z.string().max(250).optional().nullable(),
  website:        z.string().max(500).optional().nullable(),
  notes:          z.string().max(500).optional().nullable(),
});

const updateProviderSchema = z.object({
  name:           z.string().min(2).max(150).optional(),
  businessName:   z.string().max(200).optional().nullable(),
  documentType:   z.enum(VALID_DOC_TYPES, { message: 'Tipo de documento inválido' }).optional().nullable(),
  documentNumber: z.string().max(20).optional().nullable(),
  contactPerson:  z.string().max(150).optional().nullable(),
  email:          z.string().email('Email inválido').max(150).optional().nullable(),
  phone:          z.string().regex(PHONE_REGEX, 'El teléfono debe tener entre 7 y 30 dígitos (puede incluir +)').max(30).optional().nullable(),
  address:        z.string().max(250).optional().nullable(),
  website:        z.string().max(500).optional().nullable(),
  notes:          z.string().max(500).optional().nullable(),
  isActive:       z.coerce.boolean().optional(),
});

const getAll = async (req, res) => {
  console.log('DEBUG: Recibida petición GET /api/providers');
  try {
    const { all } = req.query;
    console.log('DEBUG: Query param all =', all);
    const where = all === 'true' ? {} : { isActive: true };
    console.log('DEBUG: Consultando Prisma...');
    const providers = await prisma.provider.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const data = providers.map(p => ({ ...p, productCount: 0 }));
    return res.status(200).json({ success: true, total: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOne = async (req, res) => {
  try {
    const providerId = Number(req.params.id);
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        // Productos donde este proveedor es el principal (providerId directo)
        products: {
          where: { isActive: true },
          select: {
            id: true, name: true, price: true, stock: true, image: true, sku: true,
            category: { select: { id: true, name: true } },
          },
        },
        // Productos vinculados por la tabla muchos-a-muchos
        productProviders: {
          include: {
            product: {
              select: {
                id: true, name: true, price: true, stock: true, image: true, sku: true,
                isActive: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!provider || !provider.isActive) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });

    // Combinar ambas relaciones sin duplicados, filtrando inactivos
    const allProductsMap = new Map();
    for (const p of provider.products || []) {
      allProductsMap.set(p.id, p);
    }
    for (const pp of provider.productProviders || []) {
      if (pp.product && pp.product.isActive) {
        const { isActive, ...rest } = pp.product;
        allProductsMap.set(rest.id, rest);
      }
    }

    const { productProviders, ...providerData } = provider;
    return res.status(200).json({
      success: true,
      data: { ...providerData, products: Array.from(allProductsMap.values()) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const parsed = validate(createProviderSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ success: false, message: parsed.error });

    const { name, businessName, documentType, documentNumber, contactPerson, email, phone, address, website, notes } = parsed.data;

    if (email) {
      const existing = await prisma.provider.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Este email de proveedor ya existe' });
    }

    // Validar documento
    if (documentNumber && !validateProviderDoc(documentType, documentNumber)) {
      return res.status(400).json({ success: false, message: documentType === 'PAS' ? 'El pasaporte debe tener entre 8 y 15 caracteres alfanuméricos' : 'El número de documento es inválido (máx 20 caracteres, solo dígitos y guión para NIT)' });
    }

    // Validar documento duplicado al crear
    if (documentNumber) {
      const existingDoc = await prisma.provider.findFirst({ where: { documentNumber } });
      if (existingDoc) return res.status(409).json({ success: false, message: 'Ya existe un proveedor con este número de documento' });
    }

    const provider = await prisma.provider.create({
      data: {
        name,
        businessName: businessName ?? undefined,
        documentType: documentType ?? undefined,
        documentNumber: documentNumber ?? undefined,
        contactPerson: contactPerson ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        website: website ?? undefined,
        notes: notes ?? undefined,
        isActive: true,
      },
    });

    return res.status(201).json({ success: true, message: 'Proveedor registrado correctamente', data: provider });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const parsed = validate(updateProviderSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ success: false, message: parsed.error });

    const providerId = Number(req.params.id);
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });

    const { name, businessName, documentType, documentNumber, contactPerson, email, phone, address, website, notes, isActive } = parsed.data;

    if (email && email !== provider.email) {
      const existing = await prisma.provider.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Este email de proveedor ya existe' });
    }

    // Validar documento duplicado al editar (ignorar el propio registro)
    if (documentNumber && documentNumber !== provider.documentNumber) {
      // El número de documento solo puede cambiar si también cambia el tipo de documento
      if (!documentType || documentType === provider.documentType) {
        return res.status(400).json({
          success: false,
          message: 'El número de documento no puede modificarse sin cambiar también el tipo de documento'
        });
      }
      const existingDoc = await prisma.provider.findFirst({ where: { documentNumber, NOT: { id: providerId } } });
      if (existingDoc) return res.status(409).json({ success: false, message: 'Ya existe un proveedor con este número de documento' });
    }
    // Si solo cambia el tipo de documento, no se permite
    if (documentType && documentType !== provider.documentType && !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Para cambiar el tipo de documento también debe proporcionar el nuevo número de documento'
      });
    }

    const updated = await prisma.provider.update({
      where: { id: providerId },
      data: {
        name: name ?? undefined,
        businessName: businessName ?? undefined,
        documentType: documentType ?? undefined,
        documentNumber: documentNumber ?? undefined,
        contactPerson: contactPerson ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        website: website ?? undefined,
        notes: notes ?? undefined,
        isActive: isActive ?? undefined,
      },
    });

    return res.status(200).json({ success: true, message: 'Proveedor actualizado correctamente', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const providerId = Number(req.params.id);
    const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { id: true } });
    if (!provider) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    await prisma.provider.delete({ where: { id: providerId } });
    return res.status(200).json({ success: true, message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const providerId = Number(req.params.id);
    const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { id: true, isActive: true } });
    if (!provider) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    const updated = await prisma.provider.update({ where: { id: providerId }, data: { isActive: !provider.isActive } });
    const msg = updated.isActive ? 'Proveedor activado correctamente' : 'Proveedor desactivado correctamente';
    return res.status(200).json({ success: true, message: msg, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getOne, create, update, toggleStatus, remove };

