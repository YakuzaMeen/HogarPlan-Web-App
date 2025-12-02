const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    const updatedNotification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(updatedNotification);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ msg: 'Notificación eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
