const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// GET: Obtener todos los inmuebles del usuario
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const inmuebles = await prisma.inmueble.findMany({
      where: { creadoPorId: req.user.id },
      orderBy: { nombreProyecto: 'asc' },
    });
    res.json(inmuebles);
  } catch (err) {
    console.error("❌ ERROR GET /inmuebles:", err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================
// POST: Crear un nuevo inmueble
// ============================================================
router.post('/', auth, async (req, res) => {
  const { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados } = req.body;

  if (!nombreProyecto || !valor || !moneda) {
    return res.status(400).json({ msg: 'Por favor, complete los campos obligatorios.' });
  }

  try {
    const nuevoInmueble = await prisma.inmueble.create({
      data: {
        nombreProyecto,
        tipoInmueble,
        direccion,
        valor: parseFloat(valor),
        moneda,
        areaMetrosCuadrados: parseFloat(areaMetrosCuadrados),
        creadoPorId: req.user.id,
      },
    });
    res.status(201).json(nuevoInmueble);
  } catch (err) {
    console.error("❌ ERROR POST /inmuebles:", err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================
// PUT: Actualizar un inmueble existente
// ============================================================
router.put('/:id', auth, async (req, res) => {
  const { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados } = req.body;
  const id = parseInt(req.params.id); // <-- ¡AQUÍ ESTÁ LA CORRECCIÓN!

  if (!nombreProyecto || !valor || !moneda) {
    return res.status(400).json({ msg: 'Por favor, complete los campos obligatorios.' });
  }

  try {
    // 1. Verificar que el inmueble existe y pertenece al usuario
    const inmueble = await prisma.inmueble.findUnique({ where: { id } });
    if (!inmueble || inmueble.creadoPorId !== req.user.id) {
      return res.status(404).json({ msg: 'Inmueble no encontrado o no autorizado.' });
    }

    // 2. Actualizar el inmueble
    const inmuebleActualizado = await prisma.inmueble.update({
      where: { id }, // Ahora 'id' es un número
      data: {
        nombreProyecto,
        tipoInmueble,
        direccion,
        valor: parseFloat(valor),
        moneda,
        areaMetrosCuadrados: parseFloat(areaMetrosCuadrados),
      },
    });

    res.json(inmuebleActualizado);
  } catch (err) {
    console.error(`❌ ERROR PUT /inmuebles/${id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================================
// DELETE: Eliminar un inmueble
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // 1. Verificar que el inmueble existe y pertenece al usuario
    const inmueble = await prisma.inmueble.findUnique({ where: { id } });
    if (!inmueble || inmueble.creadoPorId !== req.user.id) {
      return res.status(404).json({ msg: 'Inmueble no encontrado o no autorizado.' });
    }

    // 2. Eliminar el inmueble
    await prisma.inmueble.delete({ where: { id } });

    res.json({ msg: 'Inmueble eliminado correctamente.' });
  } catch (err) {
    console.error(`❌ ERROR DELETE /inmuebles/${id}:`, err.message);
    // Manejar error si el inmueble está en uso en una simulación
    if (err.code === 'P2003') {
      return res.status(400).json({ msg: 'No se puede eliminar. El inmueble está siendo usado en una o más simulaciones.' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;