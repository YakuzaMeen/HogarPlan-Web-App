const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Simulacion = require('../models/Simulacion');
const Cliente = require('../models/Cliente');
const Inmueble = require('../models/Inmueble');
const { convertirTasaAMensual, generarPlanDePagos, calcularTCEA, calcularVAN } = require('../utils/financial');

// POST api/simulaciones (Crear)
router.post('/', auth, async (req, res) => {
  const {
    clienteId, inmuebleId, montoPrestamo, plazoAnios, tipoTasa, tasaInteresAnual,
    capitalizacion = 'Mensual', seguroDesgravamen, seguroInmueble,
    periodoGraciaTotalMeses, periodoGraciaParcialMeses, aplicaBonoTechoPropio, valorBono
  } = req.body;

  try {
    const cliente = await Cliente.findById(clienteId);
    const inmueble = await Inmueble.findById(inmuebleId);
    if (!cliente || !inmueble) return res.status(404).json({ msg: 'Cliente o Inmueble no encontrado' });

    const tem = convertirTasaAMensual(tasaInteresAnual, tipoTasa, capitalizacion);
    
    const planDePagosCalculado = generarPlanDePagos({
      montoPrestamo, tem, numeroCuotas: plazoAnios * 12,
      seguroDesgravamenPorcentaje: seguroDesgravamen / 100,
      seguroInmueblePorcentaje: seguroInmueble / 100,
      periodoGraciaTotalMeses, periodoGraciaParcialMeses, valorBono: aplicaBonoTechoPropio ? valorBono : 0
    });

    const tceaCalculada = calcularTCEA(montoPrestamo, planDePagosCalculado, aplicaBonoTechoPropio ? valorBono : 0);
    const cuotaPromedio = planDePagosCalculado.reduce((acc, p) => acc + p.cuota, 0) / planDePagosCalculado.length;

    const cashFlowPrestamo = [montoPrestamo, ...planDePagosCalculado.map(p => -(p.amortizacion + p.interes))];
    const vanCalculado = calcularVAN(cashFlowPrestamo, tem);
    const tirAnualCalculada = (Math.pow(1 + tem, 12) - 1) * 100;

    const nuevaSimulacion = new Simulacion({
      cliente: clienteId, inmueble: inmuebleId, creadoPor: req.user.id,
      valorInmueble: inmueble.valor, montoPrestamo, moneda: inmueble.moneda, plazoAnios,
      tipoTasa, tasaInteresAnual, capitalizacion, seguroDesgravamen, seguroInmueble,
      periodoGraciaTotalMeses, periodoGraciaParcialMeses, aplicaBonoTechoPropio, valorBono,
      cuotaMensual: cuotaPromedio,
      planDePagos: planDePagosCalculado,
      tcea: tceaCalculada,
      van: parseFloat(vanCalculado.toFixed(2)),
      tir: parseFloat(tirAnualCalculada.toFixed(2)),
    });

    const simulacionGuardada = await nuevaSimulacion.save();
    res.status(201).json(simulacionGuardada);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET api/simulaciones (Leer todas)
router.get('/', auth, async (req, res) => {
  try {
    const simulaciones = await Simulacion.find({ creadoPor: req.user.id })
      .populate('cliente', 'nombres apellidos')
      .populate('inmueble', 'nombreProyecto valor')
      .sort({ fechaCreacion: -1 });
    res.json(simulaciones);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET api/simulaciones/:id (Leer una específica)
router.get('/:id', auth, async (req, res) => {
  try {
    const simulacion = await Simulacion.findById(req.params.id)
      .populate('cliente', 'nombres apellidos')
      .populate('inmueble', 'nombreProyecto valor');
    if (!simulacion) return res.status(404).json({ msg: 'Simulación no encontrada' });
    if (simulacion.creadoPor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    res.json(simulacion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT api/simulaciones/:id (Actualizar)
router.put('/:id', auth, async (req, res) => {
  const {
    clienteId, inmuebleId, montoPrestamo, plazoAnios, tipoTasa, tasaInteresAnual,
    capitalizacion = 'Mensual', seguroDesgravamen, seguroInmueble,
    periodoGraciaTotalMeses, periodoGraciaParcialMeses, aplicaBonoTechoPropio, valorBono
  } = req.body;

  try {
    let simulacion = await Simulacion.findById(req.params.id);
    if (!simulacion) return res.status(404).json({ msg: 'Simulación no encontrada' });
    if (simulacion.creadoPor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    const cliente = await Cliente.findById(clienteId);
    const inmueble = await Inmueble.findById(inmuebleId);
    if (!cliente || !inmueble) return res.status(404).json({ msg: 'Cliente o Inmueble no encontrado' });

    // Recalcular todo
    const tem = convertirTasaAMensual(tasaInteresAnual, tipoTasa, capitalizacion);
    const numeroCuotas = plazoAnios * 12;
    let cuotaMensualCalculada;
    if (tem > 0) {
      const factor = Math.pow(1 + tem, numeroCuotas);
      cuotaMensualCalculada = montoPrestamo * (tem * factor) / (factor - 1);
    } else {
      cuotaMensualCalculada = montoPrestamo / numeroCuotas;
    }
    
    const planDePagosCalculado = generarPlanDePagos({
      montoPrestamo, tem, numeroCuotas: plazoAnios * 12,
      seguroDesgravamenPorcentaje: seguroDesgravamen / 100,
      seguroInmueblePorcentaje: seguroInmueble / 100,
      periodoGraciaTotalMeses, periodoGraciaParcialMeses, valorBono: aplicaBonoTechoPropio ? valorBono : 0
    });

    const tceaCalculada = calcularTCEA(montoPrestamo, planDePagosCalculado, aplicaBonoTechoPropio ? valorBono : 0);
    const cuotaPromedio = planDePagosCalculado.reduce((acc, p) => acc + p.cuota, 0) / planDePagosCalculado.length;

    const cashFlowPrestamo = [montoPrestamo, ...planDePagosCalculado.map(p => -(p.amortizacion + p.interes))];
    const vanCalculado = calcularVAN(cashFlowPrestamo, tem);
    const tirAnualCalculada = (Math.pow(1 + tem, 12) - 1) * 100;

    // Actualizar la simulación
    simulacion.cliente = clienteId;
    simulacion.inmueble = inmuebleId;
    simulacion.valorInmueble = inmueble.valor;
    simulacion.montoPrestamo = montoPrestamo;
    simulacion.moneda = inmueble.moneda;
    simulacion.plazoAnios = plazoAnios;
    simulacion.tipoTasa = tipoTasa;
    simulacion.tasaInteresAnual = tasaInteresAnual;
    simulacion.capitalizacion = capitalizacion;
    simulacion.seguroDesgravamen = seguroDesgravamen;
    simulacion.seguroInmueble = seguroInmueble;
    simulacion.periodoGraciaTotalMeses = periodoGraciaTotalMeses;
    simulacion.periodoGraciaParcialMeses = periodoGraciaParcialMeses;
    simulacion.aplicaBonoTechoPropio = aplicaBonoTechoPropio;
    simulacion.valorBono = valorBono;
    simulacion.cuotaMensual = cuotaPromedio;
    simulacion.planDePagos = planDePagosCalculado;
    simulacion.tcea = tceaCalculada;
    simulacion.van = parseFloat(vanCalculado.toFixed(2));
    simulacion.tir = parseFloat(tirAnualCalculada.toFixed(2));

    const simulacionActualizada = await simulacion.save();
    res.json(simulacionActualizada);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
