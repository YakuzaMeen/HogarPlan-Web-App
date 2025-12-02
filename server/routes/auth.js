const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'supersecretjwtkey', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'supersecretjwtkey', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
