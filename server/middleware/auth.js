const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Obtener el token del header
  const token = req.header('x-auth-token');

  // 2. Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verificar el token
  try {
    const decoded = jwt.verify(token, 'supersecretjwtkey'); // La misma clave secreta
    req.user = decoded.user; // Adjuntar el payload del usuario a la petición
    next(); // Continuar con la ejecución de la ruta
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
