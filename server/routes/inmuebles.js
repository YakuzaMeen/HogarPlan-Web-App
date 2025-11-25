const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inmueble = require('../models/Inmueble');

// POST api/inmuebles (Crear)
router.post('/', auth, async (req, res) => {
  const { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados } = req.body;
  try {
    const nuevoInmueble = new Inmueble({
      nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados,
      creadoPor: req.user.id
    });
    const inmueble = await nuevoInmueble.save();
    res.json(inmueble);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET api/inmuebles (Leer)
router.get('/', auth, async (req, res) => {
  try {
    const inmuebles = await Inmueble.find({ creadoPor: req.user.id }).sort({ fechaCreacion: -1 });
    res.json(inmuebles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT api/inmuebles/:id (Actualizar)
router.put('/:id', auth, async (req, res) => {
  const { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados } = req.body;
  const inmuebleFields = { nombreProyecto, tipoInmueble, direccion, valor, moneda, areaMetrosCuadrados };

  try {
    let inmueble = await Inmueble.findById(req.params.id);
    if (!inmueble) return res.status(404).json({ msg: 'Inmueble no encontrado' });
    if (inmueble.creadoPor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    inmueble = await Inmueble.findByIdAndUpdate(req.params.id, { $set: inmuebleFields }, { new: true });
    res.json(inmueble);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE api/inmuebles/:id (Eliminar)
router.delete('/:id', auth, async (req, res) => {
  try {
    let inmueble = await Inmueble.findById(req.params.id);
    if (!inmueble) return res.status(404).json({ msg: 'Inmueble no encontrado' });
    if (inmueble.creadoPor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    await Inmueble.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Inmueble eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
