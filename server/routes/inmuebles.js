const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../db');

router.post('/', auth, async (req, res) => {
  const { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados } = req.body;
  try {
    const nuevoInmueble = await prisma.inmueble.create({
      data: {
        nombreProyecto,
        tipoInmueble,
        direccion,
        valor,
        moneda,
        areaMetrosCuadrados,
        creadoPorId: req.user.id,
      },
    });
    res.json(nuevoInmueble);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const inmuebles = await prisma.inmueble.findMany({
      where: { creadoPorId: req.user.id },
      orderBy: { fechaCreacion: 'desc' },
    });
    res.json(inmuebles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados } = req.body;
  try {
    const inmueble = await prisma.inmueble.findUnique({ where: { id: req.params.id } });
    if (!inmueble || inmueble.creadoPorId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    const inmuebleActualizado = await prisma.inmueble.update({
      where: { id: req.params.id },
      data: {
        nombreProyecto,
        tipoInmueble,
        direccion,
        valor,
        moneda,
        areaMetrosCuadrados,
      },
    });
    res.json(inmuebleActualizado);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const inmueble = await prisma.inmueble.findUnique({ where: { id } });

    if (!inmueble) {
      return res.status(404).json({ msg: 'Inmueble no encontrado' });
    }

    if (inmueble.creadoPorId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }


    await prisma.simulacion.deleteMany({ where: { inmuebleId: id } });

    await prisma.inmueble.delete({ where: { id } });
    res.json({ msg: 'Inmueble eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
