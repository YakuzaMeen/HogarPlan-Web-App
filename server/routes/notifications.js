const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Obtener todas las notificaciones del usuario logueado
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Marcar una notificación como leída
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notificación no encontrada' });

    // Asegurarse de que el usuario es dueño de la notificación
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Eliminar una notificación
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notificación no encontrada' });

    // Asegurarse de que el usuario es dueño de la notificación
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await notification.deleteOne(); // Usar deleteOne() en lugar de remove()
    res.json({ msg: 'Notificación eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notifications (para pruebas, se puede eliminar después)
// @desc    Crear una notificación (para probar el sistema)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { message, type } = req.body;
  try {
    const newNotification = new Notification({
      user: req.user.id,
      message,
      type
    });
    const notification = await newNotification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
