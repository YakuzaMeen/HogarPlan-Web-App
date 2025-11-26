const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/me
// @desc    Obtener el perfil del usuario autenticado
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id viene del middleware de autenticación
    const user = await User.findById(req.user.id).select('-password'); // No devolver la contraseña
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
