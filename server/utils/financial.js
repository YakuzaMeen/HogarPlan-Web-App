/**
 * Financial Calculation Module (Modulo de Cálculos Financieros)
 * Este módulo contiene funciones para la conversión de tasas de interés,
 * generación de planes de pago (Sistema Francés / Amortización), y
 * cálculo de indicadores financieros (TCEA, TIR, VAN).
 */

// =====================================================================
// === Funciones Auxiliares para Cálculo de TIR (Internas) =============
// =====================================================================

/**
 * Helper para calcular el Valor Presente Neto (VPN) de un flujo de caja.
 * @param {number} rate - Tasa de descuento en decimal.
 * @param {Array<number>} flows - Array de flujos de caja.
 * @returns {number} El Valor Presente Neto.
 */
function _npv(rate, flows) {
  let npvValue = 0.0;
  for (let t = 0; t < flows.length; t++) {
    npvValue += flows[t] / Math.pow(1 + rate, t);
  }
  return npvValue;
}

/**
 * Calculates the Internal Rate of Return (TIR) monthly for a cash flow.
 * Uses the Bisection method for robustness.
 * @param {Array<number>} cashFlows - Array of cash flows (CF0, CF1, CF2, ...).
 * @returns {number} The monthly TIR in decimal form, or 0 if not found/calculable.
 */
function _calcularTIR(cashFlows) {
  if (!cashFlows || cashFlows.length < 2) return 0;

  const MAX_ITERATIONS = 100;
  const PRECISION = 1e-7;

  // Rango de búsqueda para la TIR mensual (de 0% a 100% mensual)
  let low = 0.0;
  let high = 1.0;

  // Verificar si hay una raíz en el intervalo inicial
  if (_npv(low, cashFlows) * _npv(high, cashFlows) >= 0) {
    return 0; // No se puede garantizar una raíz si no hay cambio de signo
  }

  let mid = 0;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    mid = (low + high) / 2.0;
    const npvMid = _npv(mid, cashFlows);

    if (Math.abs(npvMid) < PRECISION) {
      return mid; // Solución encontrada
    }

    if (_npv(low, cashFlows) * npvMid < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return 0; // Si no converge, devolvemos 0 como valor seguro.
}

// =====================================================================
// === Funciones de Conversión de Tasas =================================
// =====================================================================

/**
 * Converts a given interest rate to the Monthly Effective Rate (TEM).
 * @param {number} tasaPorcentaje - The rate in percentage (e.g., 12.0 for 12%).
 * @param {string} tipoTasa - Type of rate (e.g., 'TEA', 'TEM', 'TNS', 'TNA').
 * @param {string} [capitalizacion='Mensual'] - Capitalization period for Nominal Rates.
 * @returns {number} The Monthly Effective Rate (TEM) in decimal form.
 * @throws {Error} If the rate type is not valid.
 */
function convertirTasaAMensual(tasaPorcentaje, tipoTasa, capitalizacion = 'Mensual') {
  const tasaDecimal = tasaPorcentaje / 100;

  // --- Effective Rates to Monthly Effective Rate (TEM) ---
  if (tipoTasa === 'TEM') return tasaDecimal;
  if (tipoTasa === 'TEB') return Math.pow(1 + tasaDecimal, 1 / 2) - 1;
  if (tipoTasa === 'TET') return Math.pow(1 + tasaDecimal, 1 / 3) - 1;
  if (tipoTasa === 'TES') return Math.pow(1 + tasaDecimal, 1 / 6) - 1;
  if (tipoTasa === 'TEA') return Math.pow(1 + tasaDecimal, 1 / 12) - 1;

  // --- Nominal Rates to Monthly Effective Rate (TEM) ---
  if (tipoTasa.startsWith('TN')) {
    let n_dias_tasa;
    switch (tipoTasa) {
      case 'TNM': n_dias_tasa = 30; break;
      case 'TNB': n_dias_tasa = 60; break;
      case 'TNT': n_dias_tasa = 90; break;
      case 'TNS': n_dias_tasa = 180; break;
      case 'TNA': n_dias_tasa = 360; break;
      default: throw new Error('Tipo de tasa nominal no válido.');
    }

    let n_dias_cap;
    switch (capitalizacion) {
      case 'Diaria': n_dias_cap = 1; break;
      case 'Quincenal': n_dias_cap = 15; break;
      case 'Mensual': n_dias_cap = 30; break;
      case 'Bimestral': n_dias_cap = 60; break;
      case 'Trimestral': n_dias_cap = 90; break;
      case 'Cuatrimestral': n_dias_cap = 120; break;
      case 'Semestral': n_dias_cap = 180; break;
      case 'Anual': n_dias_cap = 360; break;
      default: n_dias_cap = 30;
    }

    const m = n_dias_tasa / n_dias_cap;
    const j = tasaDecimal;
    const i_subperiodo = j / m;
    const tem = Math.pow(1 + i_subperiodo, 30 / n_dias_cap) - 1;
    return tem;
  }

  throw new Error('Tipo de tasa no válido.');
}

// =====================================================================
// === Función de Plan de Pagos (Amortización) =========================
// =====================================================================

/**
 * Generates the loan payment schedule (Sistema Frances / Annuity).
 * @param {object} params - Loan parameters.
 * @returns {Array<object>} The payment schedule.
 */
function generarPlanDePagos(params) {
  let { montoPrestamo, tem, numeroCuotas, seguroDesgravamenPorcentaje, seguroInmueblePorcentaje, periodoGraciaTotalMeses = 0, periodoGraciaParcialMeses = 0, valorInmueble, portes = 0 } = params;

  const planDePagos = [];
  let saldoInicial = montoPrestamo;
  const seguroInmuebleMensual = (valorInmueble * seguroInmueblePorcentaje) / 12;

  // 1. Período de Gracia Total (T) - Los intereses capitalizan
  for (let i = 1; i <= periodoGraciaTotalMeses; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    const cuotaPeriodo = seguroDesgravamen + seguroInmuebleMensual + portes;
    const saldoInicialPeriodo = saldoInicial;
    saldoInicial += interes;

    planDePagos.push({
      numeroCuota: i,
      graceFlag: 'T',
      saldoInicial: parseFloat(saldoInicialPeriodo.toFixed(2)),
      amortizacion: 0,
      interes: parseFloat(interes.toFixed(2)),
      cuotaFija: 0,
      seguroDesgravamen: parseFloat(seguroDesgravamen.toFixed(2)),
      seguroInmueble: parseFloat(seguroInmuebleMensual.toFixed(2)),
      portes: parseFloat(portes.toFixed(2)),
      cuota: parseFloat(cuotaPeriodo.toFixed(2)),
      saldoFinal: parseFloat(saldoInicial.toFixed(2)),
      flujo: -parseFloat(cuotaPeriodo.toFixed(2))
    });
  }

  // 2. Período de Gracia Parcial (P) - Solo se pagan intereses
  for (let i = 1; i <= periodoGraciaParcialMeses; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    const cuotaPeriodo = interes + seguroDesgravamen + seguroInmuebleMensual + portes;
    const saldoInicialPeriodo = saldoInicial;

    planDePagos.push({
      numeroCuota: periodoGraciaTotalMeses + i,
      graceFlag: 'P',
      saldoInicial: parseFloat(saldoInicialPeriodo.toFixed(2)),
      amortizacion: 0,
      interes: parseFloat(interes.toFixed(2)),
      cuotaFija: parseFloat(interes.toFixed(2)),
      seguroDesgravamen: parseFloat(seguroDesgravamen.toFixed(2)),
      seguroInmueble: parseFloat(seguroInmuebleMensual.toFixed(2)),
      portes: parseFloat(portes.toFixed(2)),
      cuota: parseFloat(cuotaPeriodo.toFixed(2)),
      saldoFinal: parseFloat(saldoInicial.toFixed(2)),
      flujo: -parseFloat(cuotaPeriodo.toFixed(2))
    });
  }

  // 3. Período de Cuotas Regulares (Sistema Francés)
  const cuotasRegulares = numeroCuotas - periodoGraciaTotalMeses - periodoGraciaParcialMeses;
  let cuotaFijaAmortizacionInteres = 0;

  if (cuotasRegulares > 0) {
    if (tem > 0) {
      const factor = Math.pow(1 + tem, cuotasRegulares);
      cuotaFijaAmortizacionInteres = saldoInicial * (tem * factor) / (factor - 1);
    } else {
      cuotaFijaAmortizacionInteres = saldoInicial / cuotasRegulares;
    }
  }

  for (let i = 1; i <= cuotasRegulares; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    let amortizacion = cuotaFijaAmortizacionInteres - interes;
    let cuotaTotal = cuotaFijaAmortizacionInteres + seguroDesgravamen + seguroInmuebleMensual + portes;
    let saldoFinal = saldoInicial - amortizacion;

    if (i === cuotasRegulares && Math.abs(saldoFinal) > 0.01) {
      amortizacion = saldoInicial;
      cuotaFijaAmortizacionInteres = amortizacion + interes;
      cuotaTotal = cuotaFijaAmortizacionInteres + seguroDesgravamen + seguroInmuebleMensual + portes;
      saldoFinal = 0;
    }

    planDePagos.push({
      numeroCuota: periodoGraciaTotalMeses + periodoGraciaParcialMeses + i,
      saldoInicial: parseFloat(saldoInicial.toFixed(2)),
      amortizacion: parseFloat(amortizacion.toFixed(2)),
      graceFlag: '',
      cuotaFija: parseFloat(cuotaFijaAmortizacionInteres.toFixed(2)),
      interes: parseFloat(interes.toFixed(2)),
      seguroDesgravamen: parseFloat(seguroDesgravamen.toFixed(2)),
      seguroInmueble: parseFloat(seguroInmuebleMensual.toFixed(2)),
      cuota: parseFloat(cuotaTotal.toFixed(2)),
      saldoFinal: parseFloat(saldoFinal.toFixed(2)),
      portes: parseFloat(portes.toFixed(2)),
      flujo: -parseFloat(cuotaTotal.toFixed(2))
    });
    saldoInicial = saldoFinal;
  }
  return planDePagos;
}

// =====================================================================
// === Funciones de Indicadores Financieros (TCEA, VAN) ================
// =====================================================================

/**
 * Calculates the Total Effective Cost Rate Annual (TCEA) or the Monthly TIR.
 * @param {number} desembolsoReal - Actual amount the client receives.
 * @param {Array<object>} planDePagos - The payment schedule.
 * @param {number} [costosIniciales=0] - Initial costs paid by the client.
 * @param {boolean} [returnMensual=false] - If true, returns the monthly TIR in decimal form.
 * @returns {number} The TCEA in percentage or the monthly TIR in decimal.
 */
function calcularTCEA(desembolsoReal, planDePagos, costosIniciales = 0, returnMensual = false) {
  // CF0 (positivo): Dinero que recibe el cliente (desembolso - costos que paga por adelantado).
  const cf0 = desembolsoReal - costosIniciales;

  // Flujo de caja: [CF0, -Cuota1, -Cuota2, ...]
  const cashFlows = [cf0, ...planDePagos.map(p => -p.cuota)];

  if (cf0 <= 0) {
      console.warn("CF0 es no-positivo. TCEA/TIR no calculable.");
      return 0;
  }

  const tirMensual = _calcularTIR(cashFlows);

  if (returnMensual) return tirMensual;

  // TCEA = (1 + TIR Mensual)^12 - 1
  return (Math.pow(1 + tirMensual, 12) - 1) * 100;
}

/**
 * Calculates the Net Present Value (VAN).
 * @param {Array<number>} cashFlows - Array of cash flows (CF0, CF1, CF2, ...).
 * @param {number} discountRate - The discount rate in decimal form (TEM).
 * @returns {number} The Net Present Value.
 */
function calcularVAN(cashFlows, discountRate) {
  let van = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    van += cashFlows[t] / Math.pow(1 + discountRate, t);
  }
  return van;
}

// =====================================================================
// === Exports =========================================================
// =====================================================================

module.exports = { convertirTasaAMensual, generarPlanDePagos, calcularTCEA, calcularVAN };