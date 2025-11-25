const mongoose = require('mongoose');

const SimulacionSchema = new mongoose.Schema({
  // --- Relaciones ---
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  inmueble: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inmueble',
    required: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- Parámetros de Entrada de la Simulación ---
  valorInmueble: { type: Number, required: true },
  montoPrestamo: { type: Number, required: true },
  moneda: { type: String, required: true, enum: ['Soles', 'Dólares'] },
  plazoAnios: { type: Number, required: true },
  
  // Tasa de Interés
  tipoTasa: { type: String, required: true, enum: ['Efectiva', 'Nominal'] },
  tasaInteresAnual: { type: Number, required: true },
  capitalizacion: { type: String, enum: ['Diaria', 'Quincenal', 'Mensual', 'Bimestral', 'Trimestral', 'Cuatrimestral', 'Semestral', 'Anual'], default: 'Mensual' },

  // Periodos de Gracia
  periodoGraciaTotalMeses: { type: Number, default: 0 },
  periodoGraciaParcialMeses: { type: Number, default: 0 },

  // Bonos y Seguros
  aplicaBonoTechoPropio: { type: Boolean, default: false },
  valorBono: { type: Number, default: 0 },
  seguroDesgravamen: { type: Number, required: true }, // Puede ser un % o un monto fijo
  seguroInmueble: { type: Number, required: true }, // Puede ser un % o un monto fijo

  // --- Resultados del Cálculo ---
  cuotaMensual: { type: Number, required: true },
  tcea: { type: Number, required: true }, // Tasa de Costo Efectivo Anual
  van: { type: Number, required: true }, // Valor Actual Neto
  tir: { type: Number, required: true }, // Tasa Interna de Retorno
  
  planDePagos: [{
    numeroCuota: Number,
    saldoInicial: Number,
    amortizacion: Number,
    interes: Number,
    seguroDesgravamen: Number,
    seguroInmueble: Number,
    cuota: Number,
    saldoFinal: Number
  }],

  // --- Metadata ---
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Simulacion', SimulacionSchema);
