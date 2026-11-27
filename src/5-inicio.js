
/* ================= tu día ================= */
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
const NUMW = ["cero","un","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez"];
const numw = n => n <= 10 ? NUMW[n] : String(n);
const joinY = a => a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " y " + a[a.length - 1];
function daySummary(){
  const td = today(), tm = addDays(td, 1), R = recs();
  const dueToday = R.filter(r => isTaskLike(r) && !isDone(r) && r.fecha === td).sort((a, b) => PRANK[a.prioridad] - PRANK[b.prioridad]);
  const late = R.filter(isLate).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const evs = R.filter(r => isEventLike(r) && r.fecha === td && r.estado !== "completada").sort((a, b) => (a.hora || "99").localeCompare(b.hora || "99"));
  const doneToday = R.filter(r => isTaskLike(r) && isDone(r) && r.fecha === td);
  const tmTasks = R.filter(r => isTaskLike(r) && !isDone(r) && r.fecha === tm).length;
  const tmEvs = R.filter(r => isEventLike(r) && r.fecha === tm).length;
  return { td, dueToday, late, evs, doneToday, tmTasks, tmEvs };
}
function dayHeadline(s){
  const nR = s.evs.filter(r => r.tipo === "reunion").length, nE = s.evs.length - nR, parts = [];
  if (s.dueToday.length) parts.push(s.dueToday.length === 1 ? "vence 1 pendiente" : `vencen ${s.dueToday.length} pendientes`);
  const citas = [];
  if (nR) citas.push(plural(nR, "reunión", "reuniones"));
  if (nE) citas.push(plural(nE, "evento", "eventos"));
  if (citas.length) parts.push("tienes " + joinY(citas));
  let h;
  if (parts.length) h = "Hoy " + joinY(parts) + ".";
  else if (s.doneToday.length) h = "¡Cerraste todo lo de hoy! Ahora sí, a descansar.";
  else h = say("Hoy tienes el día libre de pendientes. ¿Planificamos algo para ti?", "Hoy no tienes pendientes.");
  if (s.late.length) h += " " + (s.late.length === 1 ? "Quedó 1 pendiente atrasado." : `Quedaron ${s.late.length} pendientes atrasados.`);
  return h;
}
const lateTxt = r => `Quedó ${diffDays(r.fecha, today()) === -1 ? "de ayer" : "del " + fmtDate(r.fecha)}`;
function dayItem(r, kind){
  if (kind === "ev") return `<li class="di a-${areaKey(r.area)}" data-id="${esc(r.id)}"><span class="dt num">${r.hora ? fmtTime(r.hora) : "Sin hora"}</span><span class="dtl">${esc(r.titulo)}</span></li>`;
  return `<li class="di a-${areaKey(r.area)}" data-id="${esc(r.id)}"><button class="check" data-act="toggle" aria-label="Completar: ${esc(r.titulo)}"></button>
    <span class="dm"><span class="dtl">${esc(r.titulo)}</span><span class="caption">${kind === "late" ? esc(lateTxt(r)) : "Prioridad " + PRIOS[r.prioridad].toLowerCase()}</span></span></li>`;
}
function dayCol(title, icon, items, kind, emptyText, extra = ""){
  const more = items.length > 4 ? `<a class="btn btn-text" href="#${kind === "ev" ? "agenda" : "tareas"}">Ver ${items.length - 4} más</a>` : "";
  return `<div class="dcol ${kind} ${items.length ? "has" : ""}"><div class="dh">${ic(icon, "icon-16")}<span>${title}</span><span class="n num">${items.length}</span></div>
    ${items.length ? `<ul>${items.slice(0, 4).map(r => dayItem(r, kind)).join("")}</ul>${more}${extra}` : `<p class="caption">${emptyText}</p>`}</div>`;
}
function viewToday(){
  if (!S.loaded) return `<section class="card today" aria-label="Tu día">${loadingRows()}</section>`;
  const s = daySummary();
  return `<section class="card today" aria-labelledby="h-today">
    <div class="today-head"><div><span class="overline">Tu día</span><h2 id="h-today">${esc(dayHeadline(s))}</h2></div>
      <button class="btn btn-secondary" data-act="copy-day">${ic("copy")}Copiar resumen</button></div>
    <div class="dcols">
      ${dayCol("Vence hoy", "flag", s.dueToday, "due", "Nada vence hoy.")}
      ${dayCol("Reuniones y eventos de hoy", "users", s.evs, "ev", "Sin reuniones ni eventos hoy.")}
      ${dayCol("Atrasados", "alert", s.late, "late", "Nada atrasado. Vas al día.", `<button class="btn btn-text" data-act="late-today">${ic("snooze","icon-16")}¿Los reordenamos? Pasarlos a hoy</button>`)}
    </div>
    <p class="tomorrow caption">${ic("calendar", "icon-16")}Mañana: ${plural(s.tmTasks, "pendiente", "pendientes")} y ${plural(s.tmEvs, "reunión o evento", "reuniones o eventos")}.</p>
  </section>`;
}
function dayText(){
  const s = daySummary(), L = [`Resumen de hoy, ${fmtDate(s.td)}`, dayHeadline(s)];
  const block = (t, arr, f) => { if (arr.length) { L.push("", t); arr.forEach(r => L.push("• " + f(r))); } };
  block("Vence hoy:", s.dueToday, r => `${r.titulo} (prioridad ${PRIOS[r.prioridad].toLowerCase()})`);
  block("Reuniones y eventos:", s.evs, r => `${r.hora ? fmtTime(r.hora) + " " : ""}${r.titulo}`);
  block("Atrasados:", s.late, r => `${r.titulo} (${lateTxt(r).toLowerCase()})`);
  L.push("", `Mañana: ${plural(s.tmTasks, "pendiente", "pendientes")} y ${plural(s.tmEvs, "reunión o evento", "reuniones o eventos")}.`);
  return L.join("\n");
}
function copyText(txt, okMsg){
  const fallback = () => {
    $("#layer").innerHTML = `<div class="scrim" data-act="scrim"><div class="modal sm" role="dialog" aria-modal="true" aria-labelledby="cp-h">
      <div class="modal-h"><h2 id="cp-h">Copia tu resumen</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
      <p class="caption" style="margin-bottom:12px">No pude copiarlo automáticamente. El texto ya está seleccionado: cópialo con Ctrl+C o mantén presionado en el celular.</p>
      <label class="sr" for="cp-text">Resumen</label><textarea class="textarea" id="cp-text" readonly rows="10">${esc(txt)}</textarea></div></div>`;
    const ta = $("#cp-text"); ta.focus(); ta.select();
  };
  try { navigator.clipboard.writeText(txt).then(() => toast(okMsg, "ok"), fallback); } catch(e) { fallback(); }
}

/* ================= metas ================= */
function weekCheckins(m){ const ws = weekStart(); return checkins().filter(c => c.meta_id === m.id && c.fecha >= ws && c.fecha <= addDays(ws, 6)); }
const checkedToday = m => checkins().some(c => c.meta_id === m.id && c.fecha === today());
function nextStep(m){ return recs().filter(r => r.meta_id === m.id && isTaskLike(r) && !isDone(r)).sort((a, b) => (a.fecha || "9999").localeCompare(b.fecha || "9999"))[0] || null; }
function goalCard(m, { compact = false } = {}){
  const paused = m.estado === "pausada", done = m.estado === "lograda";
  let prog = "", foot = "";
  if (m.tipo === "habito") {
    const n = weekCheckins(m).length, goal = m.frecuencia_semanal || 1, pct = Math.min(100, Math.round(n / goal * 100));
    prog = `<div class="gbar" role="progressbar" aria-label="Avance de la semana" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${n}"><i style="width:${pct}%"></i></div>`;
    foot = `<span class="caption num"><b style="color:var(--color-ink)">${n} de ${goal}</b> esta semana</span>
      ${paused || done ? "" : checkedToday(m) ? `<span class="chip st-completada">${ic("check")}Hoy ya cumpliste</span>` : `<button class="btn btn-secondary" data-act="checkin" data-meta="${esc(m.id)}">${ic("check")}Hoy fui</button>`}`;
  } else {
    const ns = nextStep(m), linked = recs().filter(r => r.meta_id === m.id && isTaskLike(r)), dn = linked.filter(isDone).length;
    if (linked.length) prog = `<div class="gbar" role="progressbar" aria-label="Pasos completados" aria-valuemin="0" aria-valuemax="${linked.length}" aria-valuenow="${dn}"><i style="width:${Math.round(dn / linked.length * 100)}%"></i></div>`;
    foot = `<span class="caption">${ns ? `Próximo paso: ${esc(ns.titulo)}${ns.fecha ? " · " + esc(fmtDate(ns.fecha)) : ""}` : m.fecha_objetivo ? `Para el ${esc(fmtDate(m.fecha_objetivo))}` : "Sin fecha objetivo"}</span>`;
  }
  return `<article class="goal a-${areaKey(m.area)} ${paused ? "paused" : ""}" data-meta-id="${esc(m.id)}">
    <div class="gh"><b>${esc(m.titulo)}</b>${done ? `<span class="chip st-lograda">${ic("trophy")}Lograda</span>` : paused ? `<span class="chip st-pendiente">${ic("pause")}Pausada</span>` : ""}
      ${compact ? "" : `<button class="icon-btn" data-act="meta-menu" data-meta="${esc(m.id)}" aria-label="Más acciones para la meta ${esc(m.titulo)}" aria-haspopup="menu">${ic("more")}</button>`}</div>
    <span class="overline">${m.tipo === "habito" ? "Hábito" : "Proyecto"} · ${esc(areaName(m.area))}</span>
    ${prog}<div class="gfoot">${foot}</div></article>`;
}

/* ================= saludo personal ================= */
function greeting(){
  const h = nowParts().hour, td = today();
  const saludo = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const nm = nombre();
  const s = daySummary(), pend = s.dueToday.length + s.evs.length;
  const corto = memoria().filter(m => m.confirmado && m.corto && (m.categoria === "gustos" || m.categoria === "personas_y_mascotas"));
  const doy = Math.floor((fromIso(td) - new Date(fromIso(td).getFullYear(), 0, 0)) / 864e5);
  let line;
  const p = P_();
  const toqueHoy = p.toque && p.toque.fecha === td;
  const puedeToque = corto.length && (!p.toque || toqueHoy || p.toque.fecha !== td);
  if (puedeToque && (toqueHoy || doy % 2 === 0) && !directo()) {
    const c = toqueHoy ? p.toque.texto : corto[doy % corto.length].corto;
    line = pend ? `Te ${pend === 1 ? "queda un pendiente" : `quedan ${numw(pend)} pendientes`} y luego, un rato para ${c}.` : `Hoy no hay pendientes. ¿Qué tal un rato para ${c}?`;
    if (!toqueHoy && S.loaded && S.toqueSent !== td) { S.toqueSent = td; setTimeout(() => upd("perfil", { toque:{ fecha:td, texto:c } }), 0); }
  } else {
    const opts = directo()
      ? [pend ? `${plural(pend, "cosa", "cosas")} para hoy.` : "Nada para hoy."]
      : pend
        ? [`Vamos por partes: hoy ${pend === 1 ? "tienes una cosa" : `tienes ${numw(pend)} cosas`} en agenda.`, `Hoy ${pend === 1 ? "hay un pendiente" : `hay ${numw(pend)} pendientes`}. Empecemos por lo más importante.`, `Ya tengo tu día ordenado: ${plural(pend, "cosa", "cosas")} para hoy.`]
        : ["Hoy tienes el día libre de pendientes. ¿Planificamos algo para ti?", "Día tranquilo. Buen momento para avanzar en tus metas.", "Nada urgente por hoy. Tú decides en qué usar el día."];
    line = opts[doy % opts.length];
  }
  return { saludo:`${saludo}${nm ? ", " + nm : ""}`, line };
}

/* ================= tarjetas de Arlet ================= */
function levelProposal(){
  const p = P_();
  if ((p.autonomia || 1) !== 1 && esPlus()) return false;
  if (nivel() !== 1) return false;
  if (p.prop_nivel && diffDays(today(), p.prop_nivel) < 7) return false;
  const conf = recs().filter(r => r.origen === "captura").sort((a, b) => (b.creado || "").localeCompare(a.creado || "")).slice(0, 15);
  return conf.length >= 15 && conf.filter(r => r.sin_cambios).length >= 12;
}
/* avisos de Plus: como máximo uno al día, y nunca dentro del diario */
function nudgeOk(ctx){ const a = P_().aviso_plus, td = today(); return !a || a.fecha !== td || a.ctx === ctx; }
function markNudge(ctx){ const td = today(), a = P_().aviso_plus; if ((a && a.fecha === td) || S.nudgeSent === td || !S.loaded) return; S.nudgeSent = td; setTimeout(() => upd("perfil", { aviso_plus:{ fecha:td, ctx } }), 0); }
const card = (icon, title, text, acts, amber = false) => `<div class="acard ${amber ? "amber" : ""}"><span class="ic">${ic(icon)}</span><div class="tx"><div><h3>${title}</h3><p class="caption">${text}</p></div>${acts ? `<div class="acts">${acts}</div>` : ""}</div></div>`;
const verPlus = (label = "Ver planes") => `<a class="btn btn-secondary" href="#precios">${label}</a>`;
const ahoraNo = `<button class="btn btn-text" data-act="nudge-no">Ahora no</button>`;
function planCard(){
  const p = P_(), ef = planEf(), td = today(), C = ARLET_CONFIG;
  if (ef.en_gracia) return card("alert", "No pude renovar tu Plus", `Puede ser un tema de la tarjeta. Revisa tu medio de pago cuando puedas: mantienes Plus hasta el ${esc(fmtDate(addDays(ef.gracia_hasta, -1)))}.`, `<a class="btn btn-secondary" href="#cuenta">Ver mi plan</a>`);
  const pl = p.plan;
  if (pl && pl.estado === "prueba" && ef.plus) {
    const n = PL.diasRestantes(pl, td);
    if (n <= C.prueba.aviso_dias_antes && nudgeOk("prueba")) { markNudge("prueba");
      return card("heart", n === 1 ? "Te queda 1 día de Plus. ¿Seguimos juntas?" : `Te quedan ${n} días de Plus. ¿Seguimos juntas?`, "Si no eliges un plan, pasas a Gratis y todo lo tuyo se queda contigo. Lo de Plus queda en solo lectura.", verPlus() + ahoraNo, true); }
  }
  if (ef.estado === "vencida" && ef.anterior && ef.anterior.fin_periodo && diffDays(td, ef.anterior.fin_periodo) <= 3 && nudgeOk("fin")) { markNudge("fin");
    return card("info", ef.anterior.estado === "prueba" ? "Terminó tu prueba de Plus" : "Tu Plus terminó", "Todo lo tuyo sigue aquí. Tus metas, hábitos y lo que aprendí de ti quedan en solo lectura hasta que vuelvas a Plus.", verPlus() + ahoraNo); }
  if (!ef.plus) {
    const u = PL.usadas(p.uso, td), l = PL.limite(ef);
    if (u >= l && nudgeOk("uso")) { markNudge("uso"); return card("capture", `Este mes ya usaste tus ${l} capturas con IA`, "Puedes seguir escribiendo a mano o pasarte a Plus.", verPlus("Ver Plus") + ahoraNo); }
    if (u >= C.aviso_capturas_en && nudgeOk("uso")) { markNudge("uso"); return card("capture", `Llevas ${u} de ${l} capturas con IA este mes`, `Te quedan ${l - u}. Con Plus no tienes que contarlas.`, verPlus("Ver Plus") + ahoraNo); }
  }
  return "";
}
function arletCards(){
  const out = [], p = P_(), dow = fromIso(today()).getDay();
  const pc = planCard(); if (pc) out.push(pc);
  if (!p.onboarding_completo) out.push(card("heart", "Terminemos de conocernos", "Son unos minutos y me ayudan a acompañarte mejor. Al terminar te regalo 14 días de Plus.", `<a class="btn btn-secondary" href="#bienvenida">Seguir la entrevista</a>`, true));
  if (levelProposal()) {
    if (esPlus()) out.push(card("capture", "Ya te voy conociendo", "En tus últimas 15 capturas casi no tuviste que corregirme. ¿Quieres que guarde directo lo que tenga claro? Siempre te preguntaré lo dudoso.", `<button class="btn btn-secondary" data-act="level-yes">Sí, guarda directo</button><button class="btn btn-text" data-act="level-no">Todavía no</button>`));
    else if (!pc && nudgeOk("nivel")) { markNudge("nivel"); out.push(card("capture", "Ya te voy conociendo", "En tus últimas 15 capturas casi no tuviste que corregirme. Podría guardar directo lo que tenga claro y preguntarte solo lo dudoso. Guardar directo es parte de Plus.", verPlus("Ver Plus") + `<button class="btn btn-text" data-act="level-no">Todavía no</button>`)); }
  }
  const pat = esPlus() ? pendingPattern() : null;
  if (pat) out.push(card("sync", "Aprendí algo de tus correcciones", esc(pat.texto), `<button class="btn btn-secondary" data-act="pat-yes">Sí, recuérdalo</button><button class="btn btn-text" data-act="pat-no">No, gracias</button>`));
  if ((dow === 0 || dow === 1) && p.plan_semana !== weekStart()) out.push(card("calendar", "¿Te ayudo a planificar la semana?", "Suelta todo lo que tienes en la cabeza y yo lo ordeno en pendientes.", `<button class="btn btn-secondary" data-act="plan-week">Planificar</button><button class="btn btn-text" data-act="plan-no">Ahora no</button>`));
  return out.length ? `<div class="acards">${out.join("")}</div>` : "";
}

function viewInicio(){
  const td = today(), L = S.loaded, g = greeting();
  const tasks = recs().filter(isTaskLike);
  const upcoming = tasks.filter(r => !isDone(r)).sort((a, b) => (a.fecha || "9999").localeCompare(b.fecha || "9999") || PRANK[a.prioridad] - PRANK[b.prioridad]).slice(0, 5);
  const events = recs().filter(r => isEventLike(r) && r.fecha && r.fecha >= td && r.estado !== "completada").sort((a, b) => (a.fecha + (a.hora || "99")).localeCompare(b.fecha + (b.hora || "99"))).slice(0, 4);
  const ms = metas().filter(m => m.estado === "activa");
  const autoToday = recs().filter(r => r.origen === "auto" && isoDay(r.creado) === td);
  return `
  <div class="hello"><span class="date">${longDate(td)}</span><h1>${esc(g.saludo)}</h1><p style="font-size:17px;line-height:26px;color:var(--color-gray-700);max-width:62ch">${esc(g.line)}</p></div>
  ${S.denied ? `<div class="banner err">${ic("alert")}<div><b>No tienes acceso de escritura.</b> Pide a quien te compartió Arlet que te dé acceso de colaboradora.</div></div>` : ""}
  ${S.stale && S.mode === "db" ? `<div class="banner warn">${ic("cloudoff")}<div>No hay conexión. Lo que ves puede estar desactualizado; guardamos tus cambios y los sincronizaremos al reconectarte.</div></div>` : ""}
  ${L ? arletCards() : ""}
  ${viewToday()}
  <form class="capture-card" id="quick-form" novalidate style="margin-top:var(--space-6)">
    <label for="quick">¿Qué necesitas organizar?</label>
    <div class="capture-row">
      <input class="input" id="quick" autocomplete="off" placeholder="Ej.: Reunión con el equipo el jueves a las 10 a. m." value="${esc(S.cap.phase === "idle" ? S.cap.text : "")}">
      <button class="btn btn-primary" type="submit">${ic("plus")}Agregar</button>
    </div>
    <span class="help caption" id="quick-err" role="alert"></span>
    <div class="ex"><span class="caption" style="color:#C9D6E6">Prueba con:</span>
      ${["Entregar avance de tesis el viernes","Comprar comida para los gatos mañana","Hoy fui al gym"].map(x => `<button type="button" data-ex="${esc(x)}">${esc(x)}</button>`).join("")}
    </div>
  </form>
  ${autoToday.length && nivel() > 1 ? `<section class="card" style="margin-top:var(--space-6)" aria-labelledby="h-auto">
    <div class="card-head"><div><h2 id="h-auto">Lo que guardé hoy por ti</h2><p class="caption">Revísalo cuando quieras. Puedes editarlo o deshacerlo.</p></div></div>
    <div class="list">${autoToday.map(r => rowFor(r)).join("")}</div></section>` : ""}
  <section class="card" style="margin-top:var(--space-6)" aria-labelledby="h-goals">
    <div class="card-head"><h2 id="h-goals">Tus metas esta semana</h2><a class="btn btn-text" href="#mi-vida">Ver mi vida</a></div>
    ${!L ? loadingRows() : ms.length ? `<div class="goals">${ms.slice(0, 6).map(m => goalCard(m, { compact:true })).join("")}</div>`
      : emptyState("target", "Aún no tienes metas", "¿Qué te gustaría lograr? Puede ser un hábito, como ir al gym, o un proyecto, como terminar la tesis.", `<button class="btn btn-secondary" data-act="new-meta">Crear meta</button>`)}
  </section>
  <div class="home-grid" style="margin-top:var(--space-6)">
    <section class="card" aria-labelledby="h-pend">
      <div class="card-head"><h2 id="h-pend">Pendientes próximos</h2><a class="btn btn-text" href="#tareas">Ver todo</a></div>
      ${!L ? loadingRows() : upcoming.length ? `<div class="list">${upcoming.map(r => taskRow(r)).join("")}</div>`
        : !recs().length ? emptyState("tasks","Aún no tienes registros","Escribe arriba lo que necesitas organizar, o carga unos ejemplos para explorar.",`<button class="btn btn-secondary" data-act="seed">Cargar ejemplos</button>`)
        : emptyState("tasks","No tienes pendientes", say("Hoy tienes el día libre de pendientes. ¿Planificamos algo para ti?", "Sin pendientes."))}
    </section>
    <section class="card" aria-labelledby="h-ev">
      <div class="card-head"><h2 id="h-ev">Próximos eventos</h2><a class="btn btn-text" href="#agenda">Agenda</a></div>
      ${!L ? loadingRows() : events.length ? `<div class="list">${events.map(eventRow).join("")}</div>` : emptyState("calendar","Agenda libre","No tienes reuniones ni eventos próximos.")}
    </section>
  </div>`;
}
