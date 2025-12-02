const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../db');
const { convertirTasaAMensual, generarPlanDePagos, calcularTCEA, calcularVAN } = require('../utils/financial');

router.post('/', auth, async (req, res) => {
  const {
    clienteId, inmuebleId, montoPrestamo, plazoAnios, tipoTasa, tasaInteresAnual,
    capitalizacion = 'Mensual', seguroDesgravamen, seguroInmueble,
    periodoGraciaTotalMeses, periodoGraciaParcialMeses, aplicaBonoTechoPropio, valorBono
  } = req.body;

  try {

    const clienteIdInt = parseInt(clienteId);
    const inmuebleIdInt = parseInt(inmuebleId);


    const cliente = await prisma.cliente.findUnique({ where: { id: clienteIdInt } });
    const inmueble = await prisma.inmueble.findUnique({ where: { id: inmuebleIdInt } });

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

    const nuevaSimulacion = await prisma.simulacion.create({
      data: {

        clienteId: clienteIdInt,
        inmuebleId: inmuebleIdInt,
        creadoPorId: req.user.id, // Asumiendo que el middleware auth ya parsea el ID del usuario correctamente

        valorInmueble: inmueble.valor,
        moneda: inmueble.moneda,

        montoPrestamo,
        plazoAnios,
        tipoTasa,
        tasaInteresAnual,
        capitalizacion,
        seguroDesgravamen,
        seguroInmueble,
        periodoGraciaTotalMeses,
        periodoGraciaParcialMeses,
        aplicaBonoTechoPropio,
        valorBono: aplicaBonoTechoPropio ? valorBono : 0,

        cuotaMensual: parseFloat(cuotaPromedio.toFixed(2)),
        planDePagos: planDePagosCalculado, // Prisma maneja JSON automáticamente si el campo es tipo Json
        tcea: parseFloat(tceaCalculada.toFixed(2)),
        van: parseFloat(vanCalculado.toFixed(2)),
        tir: parseFloat(tirAnualCalculada.toFixed(2)),
      }
    });

    // Volver a buscar la simulación para incluir los datos del cliente y el inmueble
    const simulacionCompleta = await prisma.simulacion.findUnique({
      where: { id: nuevaSimulacion.id },
      include: {
        cliente: { select: { id: true, nombres: true, apellidos: true } },
        inmueble: { select: { id: true, nombreProyecto: true, valor: true, moneda: true } },
      },
    });

    res.status(201).json(simulacionCompleta);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const simulaciones = await prisma.simulacion.findMany({
      where: { creadoPorId: req.user.id },
      include: {
        cliente: { select: { nombres: true, apellidos: true } },
        inmueble: { select: { nombreProyecto: true, valor: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
    res.json(simulaciones);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id); // Convertir a número

    const simulacion = await prisma.simulacion.findUnique({ where: { id } });

    if (!simulacion) {
      return res.status(404).json({ msg: 'Simulación no encontrada' });
    }

    if (simulacion.creadoPorId !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await prisma.simulacion.delete({ where: { id } });
    res.json({ msg: 'Simulación eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;