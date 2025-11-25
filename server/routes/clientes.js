const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cliente = require('../models/Cliente');

// POST api/clientes (Crear)
router.post('/', auth, async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, email, telefono, direccion, ingresoMensual } = req.body;
  try {
    const nuevoCliente = new Cliente({
      nombres, apellidos, tipoDocumento, numeroDocumento, email, telefono, direccion, ingresoMensual,
      creadoPor: req.user.id
    });
    const cliente = await nuevoCliente.save();
    res.json(cliente);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET api/clientes (Leer)
router.get('/', auth, async (req, res) => {
  try {
    const clientes = await Cliente.find({ creadoPor: req.user.id }).sort({ fechaCreacion: -1 });
    res.json(clientes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT api/clientes/:id (Actualizar)
router.put('/:id', auth, async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, email, telefono, direccion, ingresoMensual } = req.body;
  const clienteFields = { nombres, apellidos, tipoDocumento, numeroDocumento, email, telefono, direccion, ingresoMensual };

  try {
    let cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });
    if (cliente.creadoPor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    cliente = await Cliente.findByIdAndUpdate(req.params.id, { $set: clienteFields }, { new: true });
    res.json(cliente);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE api/clientes/:id (Eliminar)
router.delete('/:id', auth, async (req, res) => {
  try {
    let cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });
    if (cliente.creadoPor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Cliente eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
