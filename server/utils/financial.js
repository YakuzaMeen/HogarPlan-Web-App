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
 * Calculates the Internal Rate of Return (TIR) monthly for a cash flow.
 * Uses the Newton-Raphson method for precision.
 * @param {Array<number>} cashFlows - Array of cash flows (CF0, CF1, CF2, ...).
 * @param {number} [guess=0.005] - Initial guess for the rate (0.5% monthly).
 * @returns {number} The monthly TIR in decimal form.
 */
function _calcularTIR(cashFlows, guess = 0.005) {
  const MAX_ITERATIONS = 100;
  const PRECISION = 1e-7;
  let rate = guess;

  // Manejar el caso de flujos de caja vacíos o solo con CF0
  if (!cashFlows || cashFlows.length < 2) return 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let npv = 0;
    let dnpv = 0; // Derivada del VPN

    // Calcula VPN y la derivada del VPN
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }

    // Evitar división por cero
    if (dnpv === 0) return rate;

    const newRate = rate - npv / dnpv;

    // Condición de parada: si la diferencia es menor a la precisión
    if (Math.abs(newRate - rate) < PRECISION) return newRate;

    // Si la tasa es negativa, se reinicia con una tasa inicial menor para evitar errores
    if (newRate < -1) rate = (rate + 0.0001) / 2;
    else rate = newRate;
  }
  return rate;
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
  // Formula: TEM = (1 + TE)^ (d_mes / d_periodo) - 1
  if (tipoTasa === 'TEM') return tasaDecimal;
  if (tipoTasa === 'TEB') return Math.pow(1 + tasaDecimal, 1 / 2) - 1; // Bimestral (2 months)
  if (tipoTasa === 'TET') return Math.pow(1 + tasaDecimal, 1 / 3) - 1; // Trimestral (3 months)
  if (tipoTasa === 'TES') return Math.pow(1 + tasaDecimal, 1 / 6) - 1; // Semestral (6 months)
  if (tipoTasa === 'TEA') return Math.pow(1 + tasaDecimal, 1 / 12) - 1; // Anual (12 months)

  // --- Nominal Rates to Monthly Effective Rate (TEM) ---
  if (tipoTasa.startsWith('TN')) {
    let n_dias_tasa; // Días en el período de la Tasa Nominal
    switch (tipoTasa) {
      case 'TNM': n_dias_tasa = 30; break;
      case 'TNB': n_dias_tasa = 60; break;
      case 'TNT': n_dias_tasa = 90; break;
      case 'TNS': n_dias_tasa = 180; break;
      case 'TNA': n_dias_tasa = 360; break;
      default: throw new Error('Tipo de tasa nominal no válido.');
    }

    let n_dias_cap; // Días en el período de capitalización
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

    // m = Número de períodos de capitalización en el período de la tasa nominal
    const m = n_dias_tasa / n_dias_cap;
    // j = Tasa nominal para el período (ej. TNS del 10% -> j=0.10)
    const j = tasaDecimal;
    // i_subperiodo = Tasa efectiva para el período de capitalización
    const i_subperiodo = j / m;
    // Convertir la tasa efectiva del sub-período a TEM (Tasa Efectiva Mensual)
    // Formula: TEM = (1 + i_subperiodo) ^ (30 / n_dias_cap) - 1
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
 * El 'montoPrestamo' que ingresa aquí debe ser el monto principal a amortizar (ej. Monto solicitado - Bono).
 * @param {object} params - Loan parameters.
 * @returns {Array<object>} The payment schedule.
 */
function generarPlanDePagos(params) {
  let { montoPrestamo, tem, numeroCuotas, seguroDesgravamenPorcentaje, seguroInmueblePorcentaje, periodoGraciaTotalMeses = 0, periodoGraciaParcialMeses = 0, valorInmueble, portes = 0 } = params;

  const planDePagos = [];
  let saldoInicial = montoPrestamo;
  // Calcular seguro de inmueble mensual sobre el valor del inmueble (asumiendo 1/12)
  const seguroInmuebleMensual = (valorInmueble * seguroInmueblePorcentaje) / 12;

  // 1. Período de Gracia Total (T) - Los intereses capitalizan
  for (let i = 1; i <= periodoGraciaTotalMeses; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    // En gracia total, la cuota es solo seguros y portes (si no se paga capital o interés)
    const cuotaPeriodo = seguroDesgravamen + seguroInmuebleMensual + portes;
    const saldoInicialPeriodo = saldoInicial;
    saldoInicial += interes; // Capitalización de intereses (el saldo aumenta)

    planDePagos.push({
      numeroCuota: i,
      graceFlag: 'T',
      saldoInicial: parseFloat(saldoInicialPeriodo.toFixed(2)),
      amortizacion: 0,
      interes: parseFloat(interes.toFixed(2)),
      cuotaFija: 0, // No hay cuota fija de amortización + interés
      seguroDesgravamen: parseFloat(seguroDesgravamen.toFixed(2)),
      seguroInmueble: parseFloat(seguroInmuebleMensual.toFixed(2)),
      portes: parseFloat(portes.toFixed(2)),
      cuota: parseFloat(cuotaPeriodo.toFixed(2)),
      saldoFinal: parseFloat(saldoInicial.toFixed(2)),
      flujo: -parseFloat(cuotaPeriodo.toFixed(2)) // Flujo es el egreso
    });
  }

  // 2. Período de Gracia Parcial (P) - Solo se pagan intereses
  for (let i = 1; i <= periodoGraciaParcialMeses; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    const cuotaPeriodo = interes + seguroDesgravamen + seguroInmuebleMensual + portes;
    const saldoInicialPeriodo = saldoInicial;

    // En gracia parcial, el saldo no cambia porque se paga el interés
    planDePagos.push({
      numeroCuota: periodoGraciaTotalMeses + i,
      graceFlag: 'P',
      saldoInicial: parseFloat(saldoInicialPeriodo.toFixed(2)),
      amortizacion: 0,
      interes: parseFloat(interes.toFixed(2)),
      cuotaFija: parseFloat(interes.toFixed(2)), // El pago fijo es igual al interés
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
      // Fórmula de la Anualidad: A = P * [i(1+i)^n] / [(1+i)^n - 1]
      const factor = Math.pow(1 + tem, cuotasRegulares);
      cuotaFijaAmortizacionInteres = saldoInicial * (tem * factor) / (factor - 1);
    } else {
      // Amortización simple si la tasa es cero
      cuotaFijaAmortizacionInteres = saldoInicial / cuotasRegulares;
    }
  }

  for (let i = 1; i <= cuotasRegulares; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    let amortizacion = cuotaFijaAmortizacionInteres - interes;
    let cuotaTotal = cuotaFijaAmortizacionInteres + seguroDesgravamen + seguroInmuebleMensual + portes;
    let saldoFinal = saldoInicial - amortizacion;

    // Ajuste final para asegurar que el saldoFinal sea exactamente 0.00
    if (i === cuotasRegulares && saldoFinal !== 0) {
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
 * Builds the cash flow from the client's perspective: CF0 = Principal to Amortize - Initial Costs.
 * TCEA es la TIR anual (TEA) del flujo de caja.
 * @param {number} montoPrincipal - The loan amount to be amortized (e.g., Monto Prestamo - Bono).
 * @param {Array<object>} planDePagos - The payment schedule.
 * @param {number} [costosIniciales=0] - Initial costs paid by the client (e.g., Notariales, Tasación).
 * @param {boolean} [returnMensual=false] - If true, returns the monthly TIR in decimal form.
 * @returns {number} The TCEA in percentage (default) or the monthly TIR in decimal (if returnMensual=true).
 */
function calcularTCEA(montoPrincipal, planDePagos, costosIniciales = 0, returnMensual = false) {
  // CF0 (Ingreso) = Monto a amortizar - Costos que el cliente debe pagar de ese monto
  const cf0 = montoPrincipal - costosIniciales;

  // Flujo de caja: [CF0, -Cuota1, -Cuota2, ...]
  // Usamos el flujo de egreso total (p.cuota)
  const cashFlows = [cf0, ...planDePagos.map(p => -p.cuota)];

  // La función de TIR se detiene si el CF0 es no positivo
  if (cf0 <= 0) {
      console.warn("Cash Flow Inicial (CF0) es negativo o cero. TCEA/TIR no calculable.");
      return 0;
  }

  const tirMensual = _calcularTIR(cashFlows);

  if (returnMensual) {
      return tirMensual; // Retorna la tasa mensual en decimal (TIR)
  }

  // TCEA = TEA = (1 + TIR Mensual)^12 - 1
  return (Math.pow(1 + tirMensual, 12) - 1) * 100; // Retorna TCEA en porcentaje
}

/**
 * Calculates the Net Present Value (VAN).
 * @param {Array<number>} cashFlows - Array of cash flows (CF0, CF1, CF2, ...).
 * @param {number} discountRate - The discount rate in decimal form (TEM/Tasa de oportunidad).
 * @returns {number} The Net Present Value.
 */
function calcularVAN(cashFlows, discountRate) {
  let van = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    // Si la tasa de descuento es cero, la fórmula simplifica a la suma de los flujos
    if (discountRate === 0) {
        van += cashFlows[t];
    } else {
        van += cashFlows[t] / Math.pow(1 + discountRate, t);
    }
  }
  return van;
}

// =====================================================================
// === Exports =========================================================
// =====================================================================

module.exports = { convertirTasaAMensual, generarPlanDePagos, calcularTCEA, calcularVAN };