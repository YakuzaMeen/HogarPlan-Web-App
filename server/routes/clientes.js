const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../db');

router.post('/', auth, async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, email, telefono, direccion, ingresoMensual } = req.body;
  try {
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombres,
        apellidos,
        tipoDocumento,
        numeroDocumento,
        email,
        telefono,
        direccion,
        ingresoMensual,
        creadoPorId: req.user.id,
      },
    });
    res.json(nuevoCliente);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { creadoPorId: req.user.id },
      orderBy: { fechaCreacion: 'desc' },
    });
    res.json(clientes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, email, telefono, direccion, ingresoMensual } = req.body;
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id: req.params.id } });
    if (!cliente || cliente.creadoPorId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    const clienteActualizado = await prisma.cliente.update({
      where: { id: req.params.id },
      data: {
        nombres,
        apellidos,
        tipoDocumento,
        numeroDocumento,
        email,
        telefono,
        direccion,
        ingresoMensual,
      },
    });
    res.json(clienteActualizado);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const cliente = await prisma.cliente.findUnique({ where: { id } });

    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado' });
    }

    if (cliente.creadoPorId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }


    await prisma.simulacion.deleteMany({ where: { clienteId: id } });

    await prisma.cliente.delete({ where: { id } });
    res.json({ msg: 'Cliente eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
