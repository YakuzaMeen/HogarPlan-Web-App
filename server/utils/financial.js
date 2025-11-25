function convertirTasaAMensual(tasaAnual, tipoTasa, capitalizacion = 'Mensual') {
  const tasaAnualDecimal = tasaAnual / 100;
  if (tipoTasa === 'Efectiva') return Math.pow(1 + tasaAnualDecimal, 1 / 12) - 1;
  if (tipoTasa === 'Nominal') {
    const periodos = { 'Diaria': 360, 'Quincenal': 24, 'Mensual': 12, 'Bimestral': 6, 'Trimestral': 4, 'Cuatrimestral': 3, 'Semestral': 2, 'Anual': 1 };
    const m = periodos[capitalizacion];
    if (!m) throw new Error('Periodo de capitalización no válido');
    const i_periodica = tasaAnualDecimal / m;
    return Math.pow(1 + i_periodica, m / 12) - 1;
  }
  throw new Error('Tipo de tasa no válido.');
}

function generarPlanDePagos(params) {
  let { montoPrestamo, tem, numeroCuotas, seguroDesgravamenPorcentaje, seguroInmueblePorcentaje, periodoGraciaTotalMeses = 0, periodoGraciaParcialMeses = 0, valorBono = 0 } = params;
  
  const planDePagos = [];
  let saldoInicial = montoPrestamo - valorBono;
  const seguroInmuebleMensual = (montoPrestamo * seguroInmueblePorcentaje) / 12;

  // 1. Periodo de Gracia Total
  for (let i = 1; i <= periodoGraciaTotalMeses; i++) {
    const interes = saldoInicial * tem;
    saldoInicial += interes; // Capitalización de intereses
    planDePagos.push({ numeroCuota: i, saldoInicial, amortizacion: 0, interes, seguroDesgravamen: 0, seguroInmueble: 0, cuota: 0, saldoFinal: saldoInicial });
  }

  // 2. Periodo de Gracia Parcial
  for (let i = 1; i <= periodoGraciaParcialMeses; i++) {
    const interes = saldoInicial * tem;
    planDePagos.push({ numeroCuota: periodoGraciaTotalMeses + i, saldoInicial, amortizacion: 0, interes, seguroDesgravamen: 0, seguroInmueble: 0, cuota: interes, saldoFinal: saldoInicial });
  }

  // 3. Periodo de Cuotas Regulares
  const cuotasRegulares = numeroCuotas - periodoGraciaTotalMeses - periodoGraciaParcialMeses;
  let cuotaFija;
  if (tem > 0) {
    const factor = Math.pow(1 + tem, cuotasRegulares);
    cuotaFija = saldoInicial * (tem * factor) / (factor - 1);
  } else {
    cuotaFija = saldoInicial / cuotasRegulares;
  }

  for (let i = 1; i <= cuotasRegulares; i++) {
    const interes = saldoInicial * tem;
    const seguroDesgravamen = saldoInicial * seguroDesgravamenPorcentaje;
    const amortizacion = cuotaFija - interes;
    const cuotaTotal = cuotaFija + seguroDesgravamen + seguroInmuebleMensual;
    const saldoFinal = saldoInicial - amortizacion;
    planDePagos.push({
      numeroCuota: periodoGraciaTotalMeses + periodoGraciaParcialMeses + i,
      saldoInicial: parseFloat(saldoInicial.toFixed(2)),
      amortizacion: parseFloat(amortizacion.toFixed(2)),
      interes: parseFloat(interes.toFixed(2)),
      seguroDesgravamen: parseFloat(seguroDesgravamen.toFixed(2)),
      seguroInmueble: parseFloat(seguroInmuebleMensual.toFixed(2)),
      cuota: parseFloat(cuotaTotal.toFixed(2)),
      saldoFinal: parseFloat(saldoFinal.toFixed(2)),
    });
    saldoInicial = saldoFinal;
  }
  return planDePagos;
}

function calcularTIR(cashFlows, guess = 0.1) {
  const MAX_ITERATIONS = 100; const PRECISION = 1e-7; let rate = guess;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let npv = 0; let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < PRECISION) return newRate;
    rate = newRate;
  }
  return rate;
}

function calcularTCEA(montoPrestamo, planDePagos, valorBono = 0) {
  const cashFlows = [montoPrestamo - valorBono, ...planDePagos.map(p => -p.cuota)];
  const tirMensual = calcularTIR(cashFlows);
  return (Math.pow(1 + tirMensual, 12) - 1) * 100;
}

function calcularVAN(cashFlows, discountRate) {
  let van = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    van += cashFlows[t] / Math.pow(1 + discountRate, t);
  }
  return van;
}

module.exports = { convertirTasaAMensual, generarPlanDePagos, calcularTCEA, calcularVAN, calcularTIR };
