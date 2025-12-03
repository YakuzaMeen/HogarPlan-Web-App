const express = require('express');
const router = express.Router();
// Asumiendo que 'auth' es tu middleware de autenticación
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Importación de las funciones financieras corregidas
const { convertirTasaAMensual, generarPlanDePagos, calcularTCEA, calcularVAN } = require('../utils/financial');

/**
 * Función central para calcular el plan de pagos, TCEA, TIR y VAN, y guardar/actualizar la simulación en la base de datos.
 * @param {object} datos - Parámetros de la simulación.
 * @param {number} usuarioId - ID del usuario creador.
 * @param {number | null} idSimulacion - ID de la simulación a actualizar (null si es nueva).
 * @returns {Promise<object>} La simulación creada o actualizada.
 * @throws {Error} Si el inmueble no es encontrado.
 */
async function calcularYGuardarSimulacion(datos, usuarioId, idSimulacion = null) {
  const {
    clienteId, inmuebleId, montoPrestamo, plazoAnios, tipoTasa, tasaInteresAnual,
    capitalizacion = 'Mensual', seguroDesgravamen, seguroInmueble,
    periodoGraciaTotalMeses, periodoGraciaParcialMeses, aplicaBonoTechoPropio, valorBono,
    costesNotariales = 0, costesRegistrales = 0, tasacion = 0, portes = 0, cok = 5.0 // COK: Costo de Oportunidad de Capital
  } = datos;

  const clienteIdInt = parseInt(clienteId);
  const inmuebleIdInt = parseInt(inmuebleId);

  // 1. Obtener datos del inmueble
  const inmueble = await prisma.inmueble.findUnique({ where: { id: inmuebleIdInt } });
  if (!inmueble) {
    const error = new Error('Inmueble no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // 2. Definición de variables financieras clave
  const costosIniciales = costesNotariales + costesRegistrales + tasacion;

  // Desembolso Real: Dinero que se necesita para el activo después de aplicar el bono.
  // Este es el flujo de caja inicial (CF0) para los cálculos de TIR/VAN.
  const desembolsoReal = montoPrestamo - (aplicaBonoTechoPropio ? valorBono : 0);

  // Monto Total Financiado: El desembolso real más los costos iniciales que el banco también financia.
  // Este es el monto sobre el cual se calcula el plan de pagos (el principal a amortizar).
  const montoTotalFinanciado = desembolsoReal + costosIniciales;

  // 3. Cálculos Financieros
  const tem = convertirTasaAMensual(tasaInteresAnual, tipoTasa, capitalizacion);

  const planDePagosCalculado = generarPlanDePagos({
    montoPrestamo: montoTotalFinanciado, // El plan de pagos se calcula sobre el total financiado
    tem,
    numeroCuotas: plazoAnios * 12,
    seguroDesgravamenPorcentaje: seguroDesgravamen / 100,
    seguroInmueblePorcentaje: seguroInmueble / 100,
    periodoGraciaTotalMeses,
    periodoGraciaParcialMeses,
    valorInmueble: inmueble.valor,
    portes
  });

  // TCEA / TIR Cálculo
  // CF0 para TCEA/TIR: El flujo de caja inicial es el Desembolso Real (montoPrestamo - bono),
  // asumiendo que los costos iniciales están financiados y se pagan en las cuotas.
  
  // 1. Obtener la TIR Mensual real (en decimal) de los flujos de caja.
  // Usamos: montoPrincipal (montoPrestamo) - costosIniciales (valorBono) = desembolsoReal (CF0)
  // La TCEA se calcula sobre el dinero que realmente se necesita (desembolsoReal) y los costos que se pagan.
  const tirMensualCalculada = calcularTCEA(
    desembolsoReal,
    planDePagosCalculado,
    costosIniciales,
    true // Indicamos a calcularTCEA que retorne la TIR mensual en decimal
  );

  // 2. TCEA (Costo Efectivo Total Anual) es la TIR Mensual anualizada.
  const tceaCalculada = (Math.pow(1 + tirMensualCalculada, 12) - 1) * 100;
  
  // 3. La TIR anualizada (para guardar en la BD) es la TCEA.
  const tirAnualCalculada = tceaCalculada;

  // VAN
  // El flujo para el VAN (y TCEA) usa el desembolso real que recibe/utiliza el cliente como CF0.
  const cashFlowParaVAN = [desembolsoReal, ...planDePagosCalculado.map(p => -p.cuota)];
  // Tasa de descuento mensual (COK anualizado)
  const cokMensual = Math.pow(1 + (cok / 100), 1 / 12) - 1;
  const vanCalculado = calcularVAN(cashFlowParaVAN, cokMensual);

  // Cuota Promedio
  const cuotaPromedio = planDePagosCalculado.reduce((acc, p) => acc + p.cuota, 0) / planDePagosCalculado.length;

  // 4. Estructura de Datos para Prisma
  const datosSimulacion = {
    clienteId: clienteIdInt,
    inmuebleId: inmuebleIdInt,
    creadoPorId: usuarioId,
    valorInmueble: inmueble.valor,
    moneda: inmueble.moneda,
    montoPrestamo,
    plazoAnios,
    tipoTasa,
    tasaInteresAnual,
    capitalizacion: tipoTasa.startsWith('TN') ? capitalizacion : null,
    seguroDesgravamen,
    seguroInmueble,
    periodoGraciaTotalMeses,
    periodoGraciaParcialMeses,
    aplicaBonoTechoPropio,
    valorBono: aplicaBonoTechoPropio ? valorBono : 0,
    costesNotariales,
    costesRegistrales,
    tasacion,
    portes,
    cok,
    cuotaMensual: parseFloat(cuotaPromedio.toFixed(2)),
    planDePagos: planDePagosCalculado, // Prisma manejará el JSON
    tcea: parseFloat(tceaCalculada.toFixed(2)),
    van: parseFloat(vanCalculado.toFixed(2)),
    tir: parseFloat(tirAnualCalculada.toFixed(2)), // Ahora es el mismo valor que TCEA
  };

  // 5. Creación o Actualización en Prisma
  if (idSimulacion) {
    return await prisma.simulacion.update({ where: { id: idSimulacion }, data: datosSimulacion });
  } else {
    return await prisma.simulacion.create({ data: datosSimulacion });
  }
}

// =====================================================================
// === Endpoints del Router ============================================
// =====================================================================

// POST: Crear nueva simulación
router.post('/', auth, async (req, res) => {
  try {
    const nuevaSimulacion = await calcularYGuardarSimulacion(req.body, req.user.id);

    // Buscar la simulación completa para incluir cliente e inmueble en la respuesta
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
    res.status(err.statusCode || 500).json({ msg: err.message || 'Error del servidor' });
  }
});

// GET: Obtener todas las simulaciones del usuario
router.get('/', auth, async (req, res) => {
  try {
    const simulaciones = await prisma.simulacion.findMany({
      where: { creadoPorId: req.user.id },
      include: {
        cliente: { select: { id: true, nombres: true, apellidos: true } },
        inmueble: { select: { id: true, nombreProyecto: true, valor: true, moneda: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
    res.json(simulaciones);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Eliminar una simulación
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

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
    res.status(500).send('Server Error');
  }
});

// PUT: Actualizar una simulación existente
router.put('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const simulacionExistente = await prisma.simulacion.findUnique({ where: { id } });
    if (!simulacionExistente || simulacionExistente.creadoPorId !== req.user.id) {
      return res.status(404).json({ msg: 'Simulación no encontrada o no autorizada' });
    }

    const simulacionActualizada = await calcularYGuardarSimulacion(req.body, req.user.id, id);

    res.json(simulacionActualizada);

  } catch (err) {
    console.error(err.message);
    res.status(err.statusCode || 500).json({ msg: err.message || 'Error del servidor' });
  }
});

module.exports = router;