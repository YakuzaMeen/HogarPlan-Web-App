const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Reemplaza esta URI si tu base de datos está en otro lugar
    const mongoURI = 'mongodb://localhost:27017/hogarplan';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Salir del proceso con fallo si no se puede conectar
    process.exit(1);
  }
};

module.exports = connectDB;
