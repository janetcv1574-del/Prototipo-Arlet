
/* ================= IA (Claude, a través de la página; sin claves) ================= */
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const STOP = new Set("fui,voy,ido,hice,ver,dia,dias,vez,ese,esa,eso,son,fue,tal,mes,ano,para,como,este,esta,estos,estas,tengo,tener,hacer,quiero,debo,necesito,sobre,desde,hasta,antes,despues,luego,manana,todos,todas,cada,semana,veces,porque,donde,cuando,entre,otra,otro,mismo,ahora,algo,nada,solo,muy,mas,menos,bien,hoy,ayer,pasado,proximo,proxima,revisar,enviar,del,los,las,una,uno,unos,unas,con,por,que,mis,tus,sus".split(","));
const keywords = s => [...new Set(norm(s).split(/[^a-z0-9ñ]+/).filter(w => w.length >= 3 && !STOP.has(w)))];
/* En Vercel, la IA pasa por la función del servidor /api/ia (la clave vive allá, nunca aquí). */
const webSample = { json: async (prompt, opts = {}) => {
  const r = await fetch("/api/ia", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ prompt, tier:opts.modelTier || "quick" }) });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw { code: r.status === 429 ? "rate_limited" : r.status === 503 ? "not_granted" : "error", detail:e.error }; }
  return (await r.json()).data;
} };
async function getSample(){
  if (sampleFn === undefined) {
    if (window.ARLET_WEB) sampleFn = webSample;
    else { try { const C = window.claude; sampleFn = C && C.use ? await C.use("sample") : null; } catch(e){ sampleFn = null; } }
  }
  return sampleFn;
}
let aiCalls = [];
function aiBudgetOk(){ const t = Date.now(); aiCalls = aiCalls.filter(x => t - x < 3600e3); if (aiCalls.length >= 30) return false; aiCalls.push(t); return true; }
async function aiJSON(prompt, tier = "quick"){
  const fn = await getSample();
  if (!fn || !aiBudgetOk()) return null;
  try { return await fn.json(prompt, { modelTier:tier }); }
  catch(e) {
    if (e && e.code === "not_granted") sampleFn = null;
    if (perfil() && S.mode === "db") upd("perfil", { errores_ia:(P_().errores_ia || 0) + 1 });
    return null;
  }
}
/* resumen de memoria confirmada: lo único personal que viaja a la IA (nunca el diario) */
function memorySummary(){
  const p = P_(), L = [];
  L.push(`Áreas de vida de la usuaria (clave: nombre): ${userAreas().map(k => `${k}: ${AREAS[k]}`).join("; ")}.`);
  if (p.ocupacion || p.ocupacion_tipo) L.push(`Ocupación: ${[p.ocupacion_tipo, p.ocupacion].filter(Boolean).join(", ")}.`);
  const ms = metas().filter(m => m.estado === "activa");
  if (ms.length) L.push("Metas activas (id: título): " + ms.map(m => `${m.id}: ${m.titulo} (${m.tipo === "habito" ? `hábito, ${m.frecuencia_semanal || 1} por semana` : "proyecto" + (m.fecha_objetivo ? ", para " + m.fecha_objetivo : "")}; área ${m.area})`).join("; ") + ".");
  const mem = memoria().filter(m => m.confirmado);
  if (mem.length) L.push("Lo que sabes de ella (confirmado): " + mem.slice(0, 40).map(m => m.contenido).join(" | "));
  return L.join("\n");
}
function recentCorrections(){
  return correcciones().sort((a, b) => (b.creado || "").localeCompare(a.creado || "")).slice(0, 8)
    .map(c => `- "${c.texto}": ${c.campo} propuesto ${c.propuesto} → ella eligió ${c.final}`).join("\n");
}

/* ---------- intérprete básico de respaldo ---------- */
function guessArea(t){
  const has = re => re.test(t);
  if (has(/\b(tesis|universidad|curso|clases?|examen|profesor|asesora?|practica calificada|trabajo grupal|facultad|maestria|exposicion|monografia)\b/)) return "estudios";
  if (has(/\b(gym|gimnasio|correr|entrenar|entrene|yoga|doctora?|medic[oa]|dentista|cita medica|pastillas?|nutricion|caminar|nadar|pilates)\b/)) return "salud";
  if (has(/\b(viaje|viajar|vuelo|pasajes?|hotel|maleta|pasaporte|visa|aeropuerto)\b/)) return "viajes";
  if (has(/\b(pagar|banco|tarjeta|ahorrar|ahorro|presupuesto|recibos?|impuestos?|sunat|deuda|prestamo)\b/)) return "finanzas";
  if (has(/\b(gat[oa]s?|perr[oa]s?|mascotas?|veterinari[oa]|casa|limpiar|lavar|ropa|mercado|supermercado|regar|alquiler)\b/)) return "hogar";
  if (has(/\b(mama|papa|familia|herman[oa]s?|abuel[oa]s?|amig[oa]s?|cumpleanos|tia|tio|prim[oa]s?)\b/)) return "familia";
  if (has(/\b(guitarra|pintar|leer|libros?|series?|pelicula|dibujar|fotos?|tejer|cocinar)\b/)) return "hobbies";
  if (has(/\b(proyecto|equipo|cliente|trabajo|oficina|presentacion|informe|jefe|jefa|reunion|consultora|entregable|propuesta)\b/)) return "trabajo";
  return "personal";
}
const fitArea = a => userAreas().includes(a) ? a : "personal";
function matchMeta(text){
  const kw = keywords(text);
  return metas().filter(m => m.estado === "activa").find(m => keywords(m.titulo).some(w => kw.some(x => x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5))))) || null;
}
function localParse(text){
  const t = norm(text), td = today();
  const habit = matchMeta(text);
  if (habit && habit.tipo === "habito" && /\b(hoy )?(fui|hice|sali|entrene|corri|nade|practique|medite|lei)\b/.test(t))
    return finishDraft({ tipo:"checkin", titulo:habit.titulo, meta_id:habit.id, fecha:td, hora:null, prioridad:"media", area:habit.area, descripcion:"" });
  let tipo = "tarea";
  if (/\b(reunion|reunirme|reunirnos|junta|llamada con|call con|meet con)\b/.test(t)) tipo = "reunion";
  else if (/^(nota|apunte|idea)s?\b|\banotar\b/.test(t)) tipo = "nota";
  else if (/\b(recordar|recuerdame|recordatorio)\b/.test(t)) tipo = "recordatorio";
  else if (/\b(evento|cumpleanos|conferencia|concierto|taller|webinar|charla|clase de)\b/.test(t)) tipo = "evento";
  let fecha = null;
  if (/pasado manana/.test(t)) fecha = addDays(td, 2);
  else if (/\bmanana\b/.test(t) && !/de la manana/.test(t)) fecha = addDays(td, 1);
  else if (/\bhoy\b|esta noche|esta tarde/.test(t)) fecha = td;
  else if (/proxima semana|la otra semana/.test(t)) { const d = fromIso(td).getDay(); fecha = addDays(td, ((8 - d) % 7) || 7); }
  else {
    const days = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
    const m = t.match(/\b(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/);
    if (m) { const target = days.indexOf(m[1]); const cur = fromIso(td).getDay(); fecha = addDays(td, ((target - cur + 7) % 7) || 7); }
    const m2 = t.match(/\b(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/);
    if (m2) { const mi = MONL.indexOf(m2[2] === "setiembre" ? "septiembre" : m2[2]); const y = fromIso(td).getFullYear(); let c = iso(new Date(y, mi, +m2[1])); if (c < td) c = iso(new Date(y+1, mi, +m2[1])); fecha = c; }
  }
  if (tipo === "nota") fecha = null;
  let hora = null;
  const hm = t.match(/\ba las? (\d{1,2})(?:[:.](\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?|de la manana|de la tarde|de la noche|hrs?|h)?/) || t.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)/);
  if (hm && tipo !== "nota") { let h = +hm[1]; const mm = hm[2] ? +hm[2] : 0; const suf = hm[3] || ""; if (/p|tarde|noche/.test(suf) && h < 12) h += 12; if (/a\.?\s?m|manana/.test(suf) && h === 12) h = 0; if (!suf && h >= 1 && h <= 7) h += 12; if (h < 24 && mm < 60) hora = `${pad(h)}:${pad(mm)}`; }
  const area = fitArea(guessArea(t));
  let prioridad = "media";
  if (/urgente|entregar|entrega|examen|plazo|sin falta|importante|deadline|tesis/.test(t)) prioridad = "alta";
  else if (/comprar|limpiar|gatos|lavar|ordenar|regar|comida/.test(t)) prioridad = "baja";
  let descripcion = "";
  const dm = text.match(/\bpara (?:revisar|ver|hablar|definir|presentar|discutir|coordinar)\b(.+)$/i);
  if (dm) descripcion = cap1(dm[0].replace(/^para /i, ""));
  let titulo = text
    .replace(/\bpara (revisar|ver|hablar|definir|presentar|discutir|coordinar)\b.+$/i, "")
    .replace(/^(tengo que|tengo|debo|necesito|hay que|recuérdame|recuerdame|recordar|recordatorio:?|nota:?|apunte:?)\s+/i, "")
    .replace(/\b(el|este|esta|la|próximo|proximo|para el|para)?\s*(pasado mañana|mañana|hoy|esta noche|esta tarde|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|próxima semana|proxima semana)\b/gi, "")
    .replace(/\b\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/gi, "")
    .replace(/\ba las? \d{1,2}(?:[:.]\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?|de la mañana|de la tarde|de la noche|hrs?|h)?/gi, "")
    .replace(/\s{2,}/g, " ").replace(/[\s,.;:]+$/, "").trim();
  if (tipo === "reunion" && /reuni[oó]n/i.test(titulo) && !/^reuni[oó]n/i.test(titulo)) titulo = titulo.slice(titulo.search(/reuni[oó]n/i));
  titulo = cap1(titulo);
  if (titulo.length > 70) titulo = titulo.slice(0, 67).trim() + "…";
  const meta = matchMeta(text);
  return finishDraft({ tipo, titulo, descripcion, fecha, hora, prioridad, area, meta_id: meta ? meta.id : null });
}
function finishDraft(d){
  const missing = [];
  if (d.tipo !== "checkin") {
    if (isEventLike(d) && !d.fecha) missing.push("fecha");
    if (isEventLike(d) && !d.hora) missing.push("hora");
    if (isTaskLike(d) && !d.fecha) missing.push("fecha");
    if (!d.titulo) missing.push("titulo");
  }
  return { draft:d, missing };
}
function askFor(d, missing){
  if (!missing.length) return null;
  const a = TIPOS[d.tipo] ? TIPOS[d.tipo].art : "esto";
  if (missing.includes("titulo")) return `¿Cómo quieres llamar ${a}?`;
  if (missing.includes("fecha") && missing.includes("hora")) return `¿Qué día y a qué hora es ${a}? Así no se me escapa.`;
  if (missing.includes("hora")) return d.tipo === "reunion" ? "¿A qué hora es la reunión? Así no se me escapa." : `¿A qué hora es ${a}?`;
  if (d.tipo === "recordatorio") return "¿Para cuándo quieres el recordatorio?";
  return `¿Para cuándo es ${a}? Puedes elegir una fecha o guardarla sin fecha.`;
}
function sanitizeDraft(o){
  if (!o || typeof o !== "object") return null;
  const tipo = o.tipo === "checkin" ? "checkin" : TIPOS[o.tipo] ? o.tipo : "tarea";
  const meta = typeof o.meta_id === "string" ? metas().find(m => m.id === o.meta_id && m.estado === "activa") : null;
  if (tipo === "checkin" && !(meta && meta.tipo === "habito")) return null;
  const d = {
    tipo, titulo: typeof o.titulo === "string" ? o.titulo.trim().slice(0, 80) : "",
    descripcion: typeof o.descripcion === "string" ? o.descripcion.trim().slice(0, 500) : "",
    fecha: typeof o.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.fecha) ? o.fecha : null,
    hora: typeof o.hora === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(o.hora) ? o.hora : null,
    prioridad: PRIOS[o.prioridad] ? o.prioridad : "media",
    area: AREAS[o.area] ? fitArea(o.area) : "personal",
    meta_id: meta ? meta.id : null
  };
  if (tipo === "checkin") { d.titulo = meta.titulo; d.fecha = d.fecha || today(); d.area = meta.area; }
  if (d.tipo === "nota") d.hora = null;
  const conf = typeof o.confianza === "number" ? Math.max(0, Math.min(1, o.confianza)) : 0.6;
  const f = finishDraft(d);
  const q = typeof o.pregunta === "string" && o.pregunta.trim() && f.missing.length ? o.pregunta.trim().slice(0, 160) : null;
  return { ...f, question:q, conf };
}
const dateCtx = () => { const td = today(); return `Hoy es ${DOWL[fromIso(td).getDay()]} ${td} (formato AAAA-MM-DD), zona horaria ${tz()}.`; };
const DRAFT_SPEC = `- "tipo": elige con estas reglas, en este orden:
  · "tarea": una ACCIÓN que ella tiene que hacer (entregar, enviar, comprar, llamar, pagar, estudiar, terminar, preparar, revisar…), aunque tenga fecha u hora. Va a Tareas. Ej.: "entregar el informe el viernes a las 5 p. m." = tarea con fecha y hora. "Llamar al banco mañana" = tarea. "Estudiar para el examen" = tarea.
  · "reunion": un ENCUENTRO con otras personas en un momento: reunión, cita, junta, almuerzo o llamada CON alguien. Va a Agenda. Ej.: "almuerzo con Ana el sábado", "reunión con el equipo el jueves a las 10".
  · "evento": algo que OCURRE en un momento y a lo que ella asiste, sin ser una acción que deba completar: clase, examen (el día del examen), cumpleaños, concierto, taller, vuelo, partido, cita médica. Va a Agenda.
  · "recordatorio": cuando pide expresamente "recordar" o "recuérdame" algo.
  · "nota": una idea, apunte o reflexión sin acción concreta.
  · "checkin": cuenta que YA cumplió hoy un hábito de una de sus metas (ej. "hoy fui al gym").
  Si dudas entre tarea y evento, elige "tarea".
- "titulo": breve y claro, mayúscula inicial, sin fecha ni hora, máximo 60 caracteres. Reuniones: "Reunión con …" o "Reunión de …".
- "descripcion": detalle útil (propósito, contexto) o "".
- "fecha": "AAAA-MM-DD" o null. Resuelve fechas relativas desde hoy ("mañana", "pasado mañana", "la próxima semana" = lunes siguiente). Un día de la semana es su próxima ocurrencia después de hoy.
- "hora": "HH:MM" (24 h) o null.
- "prioridad": "alta" | "media" | "baja". Alta para entregas, exámenes, plazos cercanos o urgencias; baja para compras y pendientes domésticos; media en otros casos. Si lo que sabes de ella indica un patrón, síguelo.
- "area": una de las claves de sus áreas de vida.
- "meta_id": el id de una meta activa si el registro aporta claramente a ella, o null.
- "faltante": lista de datos importantes que faltan, entre "fecha", "hora" y "titulo". A una reunión o evento sin hora le falta "hora"; a una tarea o recordatorio sin fecha le falta "fecha"; una nota y un checkin no necesitan nada.
- "pregunta": si falta algo, una pregunta breve y cálida, tuteando, para pedirlo; si no, null.
- "confianza": número de 0 a 1: qué tan segura estás de haber entendido todo bien.`;
async function interpret(text, ia = true){
  const prompt = `Eres Arlet, la mano derecha de una persona joven en Perú que organiza trabajo, estudios y vida personal. ${dateCtx()}
Lo que sabes de ella:
${memorySummary()}
${recentCorrections() ? "Correcciones recientes que hizo a tus propuestas (aprende de ellas):\n" + recentCorrections() : ""}
Analiza el texto y responde SOLO con un objeto JSON con estas claves:
${DRAFT_SPEC}
Texto de la usuaria: """${text}"""`;
  const out = ia ? await aiJSON(prompt) : null;
  const s = sanitizeDraft(out);
  if (s) return applyPatterns({ ...s, source:"ia" }, text);
  const l = localParse(text);
  return applyPatterns({ ...l, question:askFor(l.draft, l.missing), source:"basica", conf:0.4 }, text);
}
/* Control propio: si la IA marca como evento o reunión algo que empieza con una acción, es una tarea. */
const VERBO_ACCION = /^(tengo que |debo |necesito |hay que |me toca |falta )?(entregar|enviar|mandar|comprar|llamar|pagar|estudiar|terminar|hacer|revisar|preparar|escribir|leer|recoger|limpiar|lavar|ordenar|imprimir|subir|avanzar|corregir|responder|contestar|renovar|reservar|sacar|tramitar|cancelar|buscar|averiguar|cocinar|organizar|actualizar|redactar|practicar|repasar|completar|presentar|resolver|arreglar|devolver|agendar|confirmar|coordinar|investigar|descargar|instalar|inscribir|matricular|depositar|transferir|cobrar|vender|regalar)\b/;
function corregirTipo(out){
  const d = out.draft;
  if ((d.tipo === "evento" || d.tipo === "reunion") && VERBO_ACCION.test(norm(d.titulo).trim()) && !/\b(con|reunion|cita|junta|almuerzo|cena)\b/.test(norm(d.titulo))) {
    d.tipo = "tarea";
    const f = finishDraft(d); out.missing = f.missing; out.question = f.missing.length ? askFor(d, f.missing) : null;
  }
  return out;
}
/* patrones aprendidos y confirmados se aplican siempre */
function applyPatterns(out, text){
  const kw = keywords(text + " " + (out.draft.titulo || ""));
  memoria().filter(m => m.confirmado && m.regla && kw.includes(m.regla.kw)).forEach(m => {
    if (m.regla.campo === "prioridad" && PRIOS[m.regla.valor]) out.draft.prioridad = m.regla.valor;
    if (m.regla.campo === "area" && AREAS[m.regla.valor]) out.draft.area = m.regla.valor;
  });
  return out;
}
/* ---------- patrones desde correcciones ---------- */
function pendingPattern(){
  const no = new Set(P_().patrones_no || []);
  const have = new Set(memoria().filter(m => m.regla).map(m => `${m.regla.kw}|${m.regla.campo}|${m.regla.valor}`));
  const count = {};
  correcciones().filter(c => c.campo === "prioridad" || c.campo === "area").forEach(c => {
    keywords(c.titulo || c.texto).forEach(w => { const key = `${w}|${c.campo}|${c.final}`; count[key] = (count[key] || 0) + 1; });
  });
  const best = Object.entries(count).filter(([k, n]) => n >= 3 && !no.has(k) && !have.has(k)).sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;
  const [kw, campo, valor] = best[0].split("|");
  const texto = campo === "prioridad" ? `¿Quieres que lo que tenga que ver con «${kw}» vaya siempre en prioridad ${PRIOS[valor].toLowerCase()}?` : `¿Quieres que lo que tenga que ver con «${kw}» vaya siempre en ${areaName(valor)}?`;
  const contenido = campo === "prioridad" ? `Lo que tiene que ver con «${kw}» va en prioridad ${PRIOS[valor].toLowerCase()}` : `Lo que tiene que ver con «${kw}» va en el área ${areaName(valor)}`;
  return { key:best[0], kw, campo, valor, texto, contenido };
}

/* ---------- metas y recuerdos desde texto libre (entrevista y diario) ---------- */
async function proposeGoals(text){
  const prompt = `${dateCtx()} Una persona joven en Perú te cuenta sus metas. Conviértelas en metas concretas.
Áreas posibles (clave: nombre): ${AREA_ORDER.map(k => `${k}: ${AREAS[k]}`).join("; ")}.
Responde SOLO con un arreglo JSON. Cada elemento: {"titulo": texto corto con mayúscula inicial (máx. 50 caracteres), "area": clave, "tipo": "habito" | "proyecto", "frecuencia_semanal": número de veces por semana (solo hábitos, si no null), "fecha_objetivo": "AAAA-MM-DD" (solo proyectos con plazo claro; usa el último día del mes o año mencionado; si no, null)}.
Texto: """${text}"""`;
  const out = await aiJSON(prompt);
  if (Array.isArray(out)) {
    const g = out.filter(x => x && typeof x.titulo === "string" && x.titulo.trim()).slice(0, 8).map(x => ({
      titulo:x.titulo.trim().slice(0, 60), area:AREAS[x.area] ? x.area : "personal", tipo:x.tipo === "habito" ? "habito" : "proyecto",
      frecuencia_semanal: x.tipo === "habito" ? Math.max(1, Math.min(7, parseInt(x.frecuencia_semanal) || 3)) : null,
      fecha_objetivo: typeof x.fecha_objetivo === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.fecha_objetivo) ? x.fecha_objetivo : null }));
    if (g.length) return g;
  }
  return text.split(/,|;|\n|\by\b(?= [a-záéíóú]+r\b)/i).map(s => s.trim()).filter(s => s.length > 3).slice(0, 8).map(s => {
    const n = norm(s), fr = n.match(/(\d)\s*(veces|dias)/);
    return { titulo:cap1(s).slice(0, 60), area:guessArea(n), tipo: fr || /cada|diario|todos los/.test(n) ? "habito" : "proyecto", frecuencia_semanal: fr ? +fr[1] : (/cada|diario|todos los/.test(n) ? 3 : null), fecha_objetivo:null };
  });
}
async function proposeFacts(text, hint){
  const prompt = `Una persona joven en Perú le cuenta algo a Arlet, su mano derecha. Contexto de la pregunta: ${hint}
Extrae hechos breves que valga la pena recordar para acompañarla mejor. Responde SOLO con un arreglo JSON (máx. 5). Cada elemento:
{"categoria": "sobre_mi" | "rutina" | "gustos" | "personas_y_mascotas" | "preferencias", "contenido": frase breve en tercera persona (ej. "Tiene dos gatos: Luna y Michi"), "corto": frase muy breve en segunda persona que encaje después de "un rato para …" (ej. "Luna y Michi", "salir a correr", "ver a tu familia"), o null si no aplica}.
No incluyas datos de salud, sexualidad, religión, política ni finanzas personales. Texto: """${text}"""`;
  const out = await aiJSON(prompt);
  if (Array.isArray(out)) {
    const f = out.filter(x => x && typeof x.contenido === "string" && x.contenido.trim()).slice(0, 5).map(x => ({
      categoria: MEM_CATS[x.categoria] && x.categoria !== "patrones" ? x.categoria : "sobre_mi", contenido:x.contenido.trim().slice(0, 160),
      corto: typeof x.corto === "string" && x.corto.trim() ? x.corto.trim().slice(0, 40) : null }));
    if (f.length) return f;
  }
  const t = text.trim().slice(0, 160);
  return t ? [{ categoria: hint.includes("recarga") ? "gustos" : "sobre_mi", contenido:cap1(t), corto: hint.includes("recarga") && t.length <= 40 ? t : null }] : [];
}

/* ---------- suelta tu mente ---------- */
/* Una sola captura para una cosa o veinte: la IA separa cada pendiente, reunión, evento o nota. */
const SPLIT_RE = /\n+|(?<=[.;!?])\s+|,\s*(?:y\s+|además\s+|tambien\s+|también\s+)?(?=(?:tengo|debo|necesito|hay que|me toca|el |la |los |las |este |esta |mañana|hoy|pasado|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|comprar|llamar|pagar|enviar|mandar|ir |hacer|reuni|recordar|recuérdame|entregar|estudiar|terminar|preparar|nota))|\s+y\s+(?:además\s+|también\s+)?(?=(?:tengo que|debo|necesito|hay que|me toca|comprar|llamar|pagar|enviar|mandar|entregar|estudiar|terminar|preparar|recordar|reuni))/i;
function splitLocal(text){ return text.split(SPLIT_RE).map(s => (s || "").trim().replace(/^(y|además|también)\s+/i, "")).filter(s => s.length > 3).slice(0, 15); }
async function interpretAll(text, ia = true){
  const prompt = `Eres Arlet, la mano derecha de una persona joven en Perú que organiza trabajo, estudios y vida personal. ${dateCtx()}
Lo que sabes de ella:
${memorySummary()}
${recentCorrections() ? "Correcciones recientes que hizo a tus propuestas (aprende de ellas):\n" + recentCorrections() + "\n" : ""}El texto puede traer UNA cosa o VARIAS mezcladas. Separa cada pendiente, reunión, evento, recordatorio o nota en un elemento distinto. Si dos frases hablan de lo mismo, júntalas en un solo elemento. No inventes nada que no esté en el texto.
Responde SOLO con un objeto JSON {"items": [ ... ]} (máximo 15 elementos). Cada elemento tiene estas claves:
${DRAFT_SPEC}
Texto de la usuaria: """${text}"""`;
  const out = ia ? await aiJSON(prompt, "default") : null;
  const arr = out && Array.isArray(out.items) ? out.items : Array.isArray(out) ? out : out && out.tipo ? [out] : null;
  if (arr) {
    const items = arr.map(sanitizeDraft).filter(Boolean).map(x => corregirTipo(applyPatterns({ ...x, source:"ia" }, x.draft.titulo)));
    if (items.length) return items;
  }
  const partes = splitLocal(text);
  return (partes.length ? partes : [text]).map(s => { const l = localParse(s); return corregirTipo(applyPatterns({ ...l, question:askFor(l.draft, l.missing), source:"basica", conf:0.4 }, s)); });
}

/* ---------- diario: cuidado primero ---------- */
const CRISIS_RE = /(suicid|quitarme la vida|matarme|no quiero (vivir|seguir|existir)|ganas de morir|quiero morir|desaparecer para siempre|hacerme dano|lastimarme|autolesi|cortarme|acabar con todo|no le encuentro sentido a (la vida|nada)|mejor (estaria )?muert|no aguanto mas (la vida|vivir))/;
async function reflectDiary(text, mood){
  if (CRISIS_RE.test(norm(text))) return { riesgo:true };
  const prompt = `Eres Arlet, la mano derecha cálida y con los pies en la tierra de una persona joven en Perú. Tono: ${directo() ? "directo y breve, pero amable" : "cercano, cálido, sin ser cursi"}; tutea; como máximo un signo de exclamación; sin emojis.
Escribió esto en su diario privado${mood ? ` (se siente: ${mood})` : ""}. ${dateCtx()}
Áreas de vida (clave: nombre): ${userAreas().map(k => `${k}: ${AREAS[k]}`).join("; ")}.
Responde SOLO con un objeto JSON:
{"riesgo": true si hay cualquier señal de crisis, autolesión o riesgo para su vida; si no, false,
 "respuesta": 1 o 2 frases breves que la acompañen (no des consejos médicos; no la culpes; no la apures),
 "tareas": hasta 3 pendientes concretos que mencione explícitamente, cada uno {"titulo", "fecha": "AAAA-MM-DD" o null, "area": clave, "prioridad": "alta"|"media"|"baja"},
 "recuerdos": hasta 2 cosas estables sobre ella que valga la pena recordar (gustos, personas, mascotas, rutinas), cada una {"categoria": "gustos"|"personas_y_mascotas"|"rutina"|"preferencias"|"sobre_mi", "contenido": frase en tercera persona}. Nunca incluyas temas sensibles (salud, emociones difíciles, relaciones, dinero) como recuerdos.}
Entrada: """${text}"""`;
  const out = await aiJSON(prompt);
  if (out && typeof out === "object") {
    if (out.riesgo === true) return { riesgo:true };
    return {
      riesgo:false,
      respuesta: typeof out.respuesta === "string" && out.respuesta.trim() ? out.respuesta.trim().slice(0, 300) : "Gracias por contármelo. Aquí queda guardado, solo para ti.",
      tareas: (Array.isArray(out.tareas) ? out.tareas : []).filter(x => x && typeof x.titulo === "string").slice(0, 3).map(x => ({ tipo:"tarea", titulo:x.titulo.trim().slice(0, 80), descripcion:"", fecha: typeof x.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.fecha) ? x.fecha : null, hora:null, area: AREAS[x.area] ? fitArea(x.area) : "personal", prioridad: PRIOS[x.prioridad] ? x.prioridad : "media" })),
      recuerdos: (Array.isArray(out.recuerdos) ? out.recuerdos : []).filter(x => x && typeof x.contenido === "string").slice(0, 2).map(x => ({ categoria: MEM_CATS[x.categoria] && x.categoria !== "patrones" ? x.categoria : "gustos", contenido:x.contenido.trim().slice(0, 160) }))
    };
  }
  const tareas = [];
  const m = text.match(/(?:tengo que|debo|necesito|hay que)\s+([^.,;\n]{4,60})/gi) || [];
  m.slice(0, 3).forEach(s => { const l = localParse(s); tareas.push({ ...l.draft, tipo:"tarea" }); });
  const resp = { "Con energía":"Qué bueno leerte con energía. Aprovechémosla en lo que más te importa.", "Tranqui":"Qué bien que estés tranqui. Aquí queda guardado, solo para ti.", "Cansada":"Se nota que ha sido un día largo. Lo de hoy puede esperar un poco; descansar también cuenta.", "Agobiada":"Sé que es una semana cargada. Vamos por partes, empezando por lo de hoy." }[mood] || "Gracias por contármelo. Aquí queda guardado, solo para ti.";
  return { riesgo:false, respuesta:resp, tareas, recuerdos:[] };
}
