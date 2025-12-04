const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// ============================================================
// GET: Obtener todas las simulaciones
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const simulaciones = await prisma.simulacion.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        valorInmueble: true,
        montoPrestamo: true,
        cuotaMensual: true,
        tcea: true,
        tir: true,
        fechaCreacion: true,

        cliente: {
          select: {
            nombres: true,
            apellidos: true
          }
        },

        inmueble: {
          select: {
            nombreProyecto: true,
            moneda: true
          }
        }
      }
    });

    res.json(simulaciones);
  } catch (err) {
    console.error("❌ ERROR GET /simulaciones:", err);
    res.status(500).json({ msg: "Error al obtener simulaciones" });
  }
});

// ============================================================
// GET: Obtener simulación por ID
// ============================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const simulacion = await prisma.simulacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        inmueble: true,
      }
    });

    if (!simulacion) return res.status(404).json({ msg: "No encontrada" });

    res.json(simulacion);
  } catch (err) {
    console.error("❌ ERROR GET /simulaciones/:id:", err);
    res.status(500).json({ msg: "Error al obtener simulación" });
  }
});

// ============================================================
// DELETE: Eliminar simulación
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.simulacion.delete({ where: { id } });

    res.json({ msg: "Simulación eliminada correctamente" });
  } catch (err) {
    console.error("❌ ERROR DELETE /simulaciones:", err);
    res.status(500).json({ msg: "Error al eliminar" });
  }
});


 // ============================================================
 // PUT: Actualizar una simulación existente
 // ============================================================
 router.put('/:id', auth, async (req, res) => {
   try {
     const id = parseInt(req.params.id);

     const simulacionExistente = await prisma.simulacion.findUnique({ where: { id } });
     if (!simulacionExistente || simulacionExistente.creadoPorId !== req.user.id) {
       return res.status(404).json({ msg: 'Simulación no encontrada o no autorizada' });
     }

     const simulacionActualizada = await calcularYGuardarSimulacion(req.body, req.user.id, id);

     // Devolvemos la simulación actualizada completa
     res.json(simulacionActualizada);

   } catch (err) {
     console.error("❌ ERROR en PUT /simulaciones/:id:", err);
     res.status(err.statusCode || 500).json({ msg: err.message || 'Error del servidor' });
   }
 });

const {
  convertirTasaAMensual,
  generarPlanDePagos,
  calcularTCEA,
  calcularVAN
} = require('../utils/financial');

/**
 * Función central: calcula plan de pagos, TCEA, TIR, VAN y guarda/actualiza la simulación.
 */
async function calcularYGuardarSimulacion(datos, usuarioId, idSimulacion = null) {
  const {
    clienteId, inmuebleId, montoPrestamo, plazoAnios, tipoTasa, tasaInteresAnual,
    capitalizacion = 'Mensual', seguroDesgravamen, seguroInmueble,
    periodoGraciaTotalMeses, periodoGraciaParcialMeses,
    aplicaBonoTechoPropio, valorBono,
    costesNotariales = 0, costesRegistrales = 0, tasacion = 0, portes = 0,
    cok = 5.0
  } = datos;

  const clienteIdInt = parseInt(clienteId);
  const inmuebleIdInt = parseInt(inmuebleId);

  // === 1. Buscar inmueble ===
  const inmueble = await prisma.inmueble.findUnique({ where: { id: inmuebleIdInt } });
  if (!inmueble) throw new Error('Inmueble no encontrado');

  // === 2. Variables financieras ===
    const costosIniciales =
    (parseFloat(costesNotariales) || 0) +
    (parseFloat(costesRegistrales) || 0) +
    (parseFloat(tasacion) || 0);

  
  console.log("\n=================  🧮 INICIO CÁLCULO SIMULACIÓN  =================\n");
  console.log("COSTOS_INICIALES =", costosIniciales);

    const desembolsoReal = (parseFloat(montoPrestamo) || 0) - (aplicaBonoTechoPropio ? (parseFloat(valorBono) || 0) : 0);
  console.log("DESEMBOLSO_REAL =", desembolsoReal);

  const montoTotalFinanciado = desembolsoReal + costosIniciales;

  // === 3. TEM ===
  const tem = convertirTasaAMensual(tasaInteresAnual, tipoTasa, capitalizacion);
  console.log("TEM (Tasa Efectiva Mensual) =", tem);

  // === 4. Plan de pagos ===
  const planDePagosCalculado = generarPlanDePagos({
    montoPrestamo: montoTotalFinanciado,
    tem,
    numeroCuotas: (parseInt(plazoAnios) || 0) * 12,
    seguroDesgravamenPorcentaje: (parseFloat(seguroDesgravamen) || 0) / 100,
    seguroInmueblePorcentaje: (parseFloat(seguroInmueble) || 0) / 100,
    periodoGraciaTotalMeses: parseInt(periodoGraciaTotalMeses) || 0,
    periodoGraciaParcialMeses: parseInt(periodoGraciaParcialMeses) || 0,
    valorInmueble: inmueble.valor,
    portes: parseFloat(portes) || 0,
  });

  console.log("PRIMERA CUOTA =", planDePagosCalculado[0]);
  console.log("ÚLTIMA CUOTA =", planDePagosCalculado[planDePagosCalculado.length - 1]);

  // === 5. TCEA / TIR ===
  console.log("\n----- CÁLCULO TCEA / TIR -----");

  const tceaCalculada = calcularTCEA(desembolsoReal, planDePagosCalculado, costosIniciales);
  console.log("TCEA_CALCULADA =", tceaCalculada);

  // La TIR que nos interesa mostrar es la TIR periódica (mensual), expresada como porcentaje.
  const tirMensual = calcularTCEA(desembolsoReal, planDePagosCalculado, costosIniciales, true);
  console.log("TIR_MENSUAL (decimal) =", tirMensual);

  // Guardamos la TIR mensual como porcentaje.
  const tirPeriodoCalculada = tirMensual * 100;
  console.log("TIR_PERIODO (%) =", tirPeriodoCalculada);

  // === 6. VAN ===
  console.log("\n----- CÁLCULO VAN -----");

  const cashFlowParaVAN = [desembolsoReal, ...planDePagosCalculado.map(p => -p.cuota)];
  console.log("CASH FLOWS PARA VAN =", cashFlowParaVAN);

  const cokMensual = Math.pow(1 + (cok / 100), 1 / 12) - 1;
  console.log("COK_MENSUAL =", cokMensual);

  const vanCalculado = calcularVAN(cashFlowParaVAN, cokMensual);
  console.log("VAN_CALCULADO =", vanCalculado);

  // === 7. Cuota promedio ===
  const cuotaPromedio =
    planDePagosCalculado.reduce((acc, p) => acc + p.cuota, 0) /
    planDePagosCalculado.length;

  console.log("CUOTA_PROMEDIO =", cuotaPromedio);

  // === 8. Datos para PRISMA ===
  console.log("\n----- DATOS GUARDADOS EN BD -----");
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
    planDePagos: planDePagosCalculado,

    tcea: parseFloat((isFinite(tceaCalculada) ? tceaCalculada : 0).toFixed(2)),
    van: parseFloat((isFinite(vanCalculado) ? vanCalculado : 0).toFixed(2)),
    tir: parseFloat((isFinite(tirPeriodoCalculada) ? tirPeriodoCalculada : 0).toFixed(4)), // Guardamos con más decimales
  };

  console.log("DATOS_SIMULACIÓN =", datosSimulacion);
  console.log("\n=================  🧮 FIN CÁLCULO SIMULACIÓN  =================\n");

  // === 9. Crear o actualizar ===
  if (idSimulacion) {
    return prisma.simulacion.update({
      where: { id: idSimulacion },
      data: datosSimulacion
    });
  } else {
    return prisma.simulacion.create({ data: datosSimulacion });
  }
}

/* ============================================================================
   ENDPOINTS
============================================================================ */

// POST - Crear simulación
router.post('/', auth, async (req, res) => {
  try {
    console.log("📩 POST /simulaciones → Datos recibidos:", req.body);

    const nuevaSimulacion = await calcularYGuardarSimulacion(req.body, req.user.id);

    const simulacionCompleta = await prisma.simulacion.findUnique({
      where: { id: nuevaSimulacion.id },
      include: {
        cliente: { select: { id: true, nombres: true, apellidos: true } },
        inmueble: { select: { id: true, nombreProyecto: true, valor: true, moneda: true } }
      }
    });

    console.log("📤 RESPUESTA FINAL ENVIADA AL FRONTEND =", simulacionCompleta);

    res.status(201).json(simulacionCompleta);
  } catch (err) {
    console.error("❌ ERROR en POST /simulaciones:", err);
    res.status(err.statusCode || 500).json({ msg: err.message });
  }
});

module.exports = router;
