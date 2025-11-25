const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Conectar a la base de datos
connectDB();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Definir Rutas
app.get('/', (req, res) => res.send('Backend API is running...'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/simulaciones', require('./routes/simulaciones'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/inmuebles', require('./routes/inmuebles')); // Nueva ruta

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
