const mongoose = require('mongoose');

const InmuebleSchema = new mongoose.Schema({
  nombreProyecto: {
    type: String,
    required: true,
    trim: true
  },
  tipoInmueble: {
    type: String,
    required: true,
    enum: ['Casa', 'Departamento', 'Terreno']
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  valor: {
    type: Number,
    required: true
  },
  moneda: {
    type: String,
    required: true,
    enum: ['Soles', 'Dólares']
  },
  areaMetrosCuadrados: {
    type: Number,
    required: true
  },
  // Enlaza al usuario que creó este inmueble
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inmueble', InmuebleSchema);
