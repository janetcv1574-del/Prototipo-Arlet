
/* ================= planes: lógica pura (sin pantalla), probada en tests/planes.test.js =================
   Un plan guardado en el perfil se ve así:
   { id: "plus"|"estudiante"|"fundadora"|"gratis", estado: "prueba"|"activa"|"cancelada"|"vencida",
     periodo: "mensual"|"anual"|null, inicio, fin_periodo (AAAA-MM-DD, el primer día SIN Plus),
     cancelada_en, pago_fallido_en, gracia_hasta, tuvo_prueba, demo }                                  */
const PL = (() => {
  const C = ARLET_CONFIG;
  const d2 = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const s2 = d => d.toISOString().slice(0, 10);
  const plusDias = (s, n) => { const d = d2(s); d.setUTCDate(d.getUTCDate() + n); return s2(d); };
  const plusMeses = (s, n) => { const d = d2(s), day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); return s2(d); };
  const dias = (a, b) => Math.round((d2(a) - d2(b)) / 864e5);
  const mesDe = s => s.slice(0, 7);

  /* El plan que vale HOY. Es la única fuente de verdad para permisos. */
  function efectivo(plan, hoy){
    const gratis = extra => ({ id:"gratis", plus:false, estado:"gratis", ...extra });
    if (!plan || !plan.id || plan.id === "gratis") return gratis(plan && plan.tuvo_prueba ? { tuvo_prueba:true } : {});
    const base = { ...plan, plus:true };
    if (plan.estado === "prueba" || plan.estado === "cancelada") return hoy < plan.fin_periodo ? base : gratis({ estado:"vencida", anterior:plan });
    if (plan.estado === "activa") {
      if (plan.pago_fallido_en) return hoy < plan.gracia_hasta ? { ...base, en_gracia:true } : gratis({ estado:"vencida", anterior:plan });
      return base;
    }
    return gratis({ estado:"vencida", anterior:plan });
  }
  const limite = ef => (C.planes[ef.id] || C.planes.gratis).capturas_mes;
  const usadas = (uso, hoy) => uso && uso.mes === mesDe(hoy) ? (uso.n || 0) : 0;
  const registrarUso = (uso, hoy) => ({ mes:mesDe(hoy), n:usadas(uso, hoy) + 1 });

  /* LA función de permisos: la usan la interfaz y cada acción antes de hacerla. */
  function puede(ef, accion, uso, hoy){
    if (accion === "captura_ia") { const u = usadas(uso, hoy), l = limite(ef); return { ok:u < l, usadas:u, limite:l, motivo: u < l ? null : "limite" }; }
    if (C.funciones_plus[accion]) return { ok:!!ef.plus, motivo: ef.plus ? null : "plus" };
    return { ok:true, motivo:null };
  }
  const nivelEfectivo = (ef, elegido) => ef.plus ? (elegido || 1) : 1;

  /* ----- transiciones (devuelven un plan nuevo; nunca tocan los datos de la usuaria) ----- */
  const iniciarPrueba = (plan, hoy) => plan && plan.tuvo_prueba ? plan : { id:"plus", estado:"prueba", periodo:null, inicio:hoy, fin_periodo:plusDias(hoy, C.prueba.dias), tuvo_prueba:true, demo:C.modo_demo };
  function activar(plan, id, periodo, hoy){
    const anual = periodo === "anual" || id === "fundadora";
    return { id, estado:"activa", periodo: anual ? "anual" : "mensual", inicio:hoy, fin_periodo: plusMeses(hoy, anual ? 12 : 1), tuvo_prueba: !!(plan && plan.tuvo_prueba), demo:C.modo_demo,
      verificado_hasta: id === "estudiante" ? plusMeses(hoy, C.planes.estudiante.reverificar_meses) : null };
  }
  const cancelar = (plan, hoy) => plan && plan.estado === "prueba" ? { ...plan, estado:"cancelada", cancelada_en:hoy }
    : plan && plan.estado === "activa" ? { ...plan, estado:"cancelada", cancelada_en:hoy, pago_fallido_en:null, gracia_hasta:null } : plan;
  const pagoRechazado = (plan, hoy) => plan && plan.estado === "activa" ? { ...plan, pago_fallido_en:hoy, gracia_hasta:plusDias(hoy, C.gracia_dias) } : plan;
  const pagoAprobado = (plan, hoy) => plan && plan.estado === "activa" ? { ...plan, pago_fallido_en:null, gracia_hasta:null, fin_periodo: plan.fin_periodo > hoy ? plan.fin_periodo : plusMeses(hoy, plan.periodo === "anual" ? 12 : 1) } : plan;
  /* Renovación automática (en la versión real la confirma el webhook del pago). */
  function renovar(plan, hoy){
    if (!plan || plan.estado !== "activa" || plan.pago_fallido_en || hoy < plan.fin_periodo) return plan;
    let fin = plan.fin_periodo; const m = plan.periodo === "anual" ? 12 : 1;
    while (fin <= hoy) fin = plusMeses(fin, m);
    return { ...plan, fin_periodo:fin, id: plan.id === "fundadora" ? "plus" : plan.id, periodo: plan.id === "fundadora" ? "anual" : plan.periodo, era_fundadora: plan.id === "fundadora" || plan.era_fundadora || false };
  }
  /* Precio del próximo cobro, en soles con IGV. */
  function proximoCobro(plan){
    if (!plan || plan.estado !== "activa") return null;
    const P = C.planes;
    if (plan.id === "fundadora") return P.fundadora.renueva_anual;
    if (plan.id === "estudiante") return P.estudiante.mensual;
    if (plan.id === "plus") return plan.periodo === "anual" ? P.plus.anual : P.plus.mensual;
    return null;
  }
  /* Ingreso mensual equivalente (para el panel): anual / 12. */
  function mensualEquivalente(plan){
    if (!plan || plan.estado !== "activa" || plan.pago_fallido_en) return 0;
    const P = C.planes;
    if (plan.id === "fundadora") return P.fundadora.primer_anio / 12;
    if (plan.id === "estudiante") return P.estudiante.mensual;
    if (plan.id === "plus") return plan.periodo === "anual" ? P.plus.anual / 12 : P.plus.mensual;
    return 0;
  }
  const diasRestantes = (plan, hoy) => plan && plan.fin_periodo ? dias(plan.fin_periodo, hoy) : null;
  const ahorroAnual = () => Math.round((C.planes.plus.mensual * 12 - C.planes.plus.anual) * 100) / 100;
  function correoUniversitario(correo){
    const c = String(correo || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return false;
    const dom = c.split("@")[1];
    return C.dominios_estudiante.some(t => dom.endsWith(t) || ("." + dom) === t);
  }
  /* Un plan completo, con cada campo presente: al guardarlo reemplaza al anterior sin dejar restos. */
  const CAMPOS = ["id","estado","periodo","inicio","fin_periodo","cancelada_en","pago_fallido_en","gracia_hasta","tuvo_prueba","demo","verificado_hasta","correo_dominio","era_fundadora"];
  const normalizar = plan => plan ? Object.fromEntries(CAMPOS.map(k => [k, plan[k] ?? null])) : null;
  /* Último día con Plus de un plan que ya terminó. */
  const ultimoDiaPlus = plan => plusDias(plan.pago_fallido_en && plan.gracia_hasta && plan.gracia_hasta < plan.fin_periodo ? plan.gracia_hasta : plan.fin_periodo, -1);
  return { normalizar, ultimoDiaPlus, efectivo, limite, usadas, registrarUso, puede, nivelEfectivo, iniciarPrueba, activar, cancelar, pagoRechazado, pagoAprobado, renovar, proximoCobro, mensualEquivalente, diasRestantes, ahorroAnual, correoUniversitario, plusDias, plusMeses, mesDe };
})();
