
/* ================= capturar ================= */
const CAP_EX = ["Tengo reunión con el equipo el jueves a las 10 a. m. para revisar los avances del proyecto","Entregar avance de tesis el viernes","Comprar comida para los gatos mañana","Recordar revisar el documento de la universidad","Nota: ideas para la presentación del cliente","Hoy fui al gym"];
function confirmCardHTML(){
  const c = S.cap, d = c.draft;
  if (d.tipo === "checkin") {
    const m = S.docs.get(d.meta_id);
    return `<section class="card confirm" aria-labelledby="h-conf"><div class="confirm-head"><h2 id="h-conf">¿Lo marco en tu meta?</h2><span class="ai-badge">${ic("capture","icon-16")}${c.source === "ia" ? "Interpretado con IA" : "Interpretación básica"}</span></div>
      <p class="quote">${esc(c.raw)}</p>
      <p>Lo anoto como cumplido hoy en <b>${esc(m ? m.titulo : "tu meta")}</b>.${m ? ` Llevarías ${weekCheckins(m).length + 1} de ${m.frecuencia_semanal || 1} esta semana.` : ""}</p>
      <div class="form-foot"><button type="button" class="btn btn-secondary" data-act="cap-as-task">Guardarlo como tarea</button><button type="button" class="btn btn-primary" data-act="cap-checkin">${ic("check")}Sí, márcalo</button></div></section>`;
  }
  const conflict = conflictOf(d);
  return `<section class="card confirm" aria-labelledby="h-conf">
    <div class="confirm-head"><h2 id="h-conf">Revisa antes de guardar</h2><span class="ai-badge">${ic("capture","icon-16")}${c.source === "ia" ? "Interpretado con IA" : "Interpretación básica"}</span></div>
    <p class="quote">${esc(c.raw)}</p>
    ${c.question ? `<div class="banner info" role="status">${ic("info")}<div><b>${esc(c.question)}</b> Complétalo abajo o guarda así si prefieres.</div></div>` : ""}
    ${c.limite ? `<div class="banner info">${ic("info")}<div>Este mes ya usaste tus capturas con IA, así que hice una lectura básica. Revisa los datos antes de guardar. <a href="#precios">Ver Plus</a></div></div>`
      : c.source !== "ia" ? `<div class="banner warn">${ic("alert")}<div>La interpretación con IA no está disponible ahora. Hice una lectura básica: revisa los datos antes de guardar.</div></div>` : ""}
    ${conflict ? `<div class="banner warn">${ic("alert")}<div>Este evento se cruza con "${esc(conflict.titulo)}" (${fmtTime(conflict.hora)}). ¿Quieres moverlo?</div></div>` : ""}
    <form id="conf-form" novalidate>${formHTML("cf", d, { errors:c.errors, ask:c.missing })}
      <div class="form-foot"><button type="button" class="btn btn-secondary" data-act="discard">Descartar</button>
        <button type="submit" class="btn btn-primary">${ic("check")}Confirmar y guardar</button></div></form></section>`;
}
function viewCapturar(){
  const c = S.cap, busy = c.phase === "loading", confirm = c.phase === "confirm", tab = S.capTab;
  const tabs = `<div class="tabs" role="tablist" aria-label="Formas de capturar">
    <button class="tab" role="tab" data-captab="una" aria-selected="${tab === "una"}">${ic("capture","icon-16")}Una cosa</button>
    <button class="tab" role="tab" data-captab="mente" aria-selected="${tab === "mente"}">${ic("pen","icon-16")}Suelta tu mente</button></div>`;
  const head = `<div class="page-head"><div><h1>Capturar</h1><p>${tab === "una" ? "Escríbeme como lo dirías en voz alta. Detecto el tipo, la fecha, la hora y la prioridad, y te pregunto lo que falte." : "Escribe todo lo que tienes en la cabeza, sin orden. Yo lo separo en pendientes y tú eliges qué guardar."}</p></div></div>`;
  if (tab === "mente") { const q2 = puede("captura_ia"); return head + tabs + (!q2.ok ? `<div class="banner info" style="margin-bottom:var(--space-5)">${ic("info")}<div><b>Este mes ya usaste tus ${q2.limite} capturas con IA.</b> Puedo separar tu texto con una lectura básica, o puedes pasarte a Plus. <a href="#precios">Ver Plus</a></div></div>` : "") + viewDump(); }
  let card = "";
  if (busy) card = `<div class="card confirm" aria-live="polite"><div class="confirm-head"><h2>Leyendo lo que escribiste…</h2><span class="ai-badge">${ic("capture","icon-16")}IA</span></div>${loadingRows()}</div>`;
  if (confirm) card = confirmCardHTML();
  const q = puede("captura_ia"), ef = planEf();
  const help = (nivel() === 1 ? "Nada se guarda hasta que confirmes." : nivel() === 2 ? "Si lo tengo muy claro, lo guardo y te aviso. Lo dudoso te lo pregunto." : "Guardo lo que tenga claro y te aviso. Lo que falta te lo pregunto.")
    + (!ef.plus && q.ok ? ` Te ${q.limite - q.usadas === 1 ? "queda 1 captura" : `quedan ${q.limite - q.usadas} capturas`} con IA este mes.` : "");
  const limitBanner = !q.ok ? `<div class="banner info" style="margin-bottom:var(--space-5)">${ic("info")}<div><b>Este mes ya usaste tus ${q.limite} capturas con IA.</b> Puedes seguir escribiendo a mano o pasarte a Plus. Si escribes aquí, hago una lectura básica y tú revisas. <a href="#precios">Ver Plus</a></div></div>` : "";
  return `${head}${tabs}${limitBanner}
  <div class="cap-grid">
    <div>
      <form class="card cap-input" id="cap-form" novalidate>
        <div class="field"><label for="cap-text">¿Qué necesitas organizar?</label>
          <textarea class="textarea" id="cap-text" placeholder="Tengo reunión con el equipo el jueves a las 10 a. m. para revisar los avances del proyecto" ${busy ? "disabled" : ""}>${esc(c.text)}</textarea>
          <span class="help" id="cap-help">${help}</span></div>
        <div class="cap-actions"><button type="submit" class="btn ${confirm ? "btn-secondary" : "btn-primary"}" ${busy ? "disabled" : ""} style="min-width:148px">${busy ? `<span class="spinner"></span>Interpretando…` : `${ic("capture")}${confirm ? "Volver a interpretar" : "Interpretar"}`}</button></div>
      </form>
      ${card}
    </div>
    <aside class="card" aria-labelledby="h-ex"><h3 id="h-ex" style="margin-bottom:12px">Ejemplos</h3>
      <div class="examples">${CAP_EX.map(x => `<button type="button" data-ex="${esc(x)}">${ic("arrow","icon-16")}<span>${esc(x)}</span></button>`).join("")}</div>
      <p class="caption" style="margin-top:16px">No reviso tu correo ni tus chats. ${nivel() === 1 ? "Y no guardo nada sin que lo confirmes." : "Puedes cambiar cuánto hago por mi cuenta en tu perfil."}</p>
    </aside>
  </div>`;
}
function viewDump(){
  const d = S.dump, busy = d.phase === "loading";
  const items = d.items;
  const list = items.length ? `<div class="dump-list" role="list">${items.map((it, i) => {
    const r = it.draft, saved = it.saved;
    const meta = r.tipo === "checkin" ? `Cumplido hoy · ${esc(metaName(r.meta_id) || "")}` : `${TIPOS[r.tipo].n} · ${esc(areaName(r.area))}${r.fecha ? " · " + esc(fmtDate(r.fecha)) : ""}${r.hora ? " · " + fmtTime(r.hora) : ""}`;
    return `<div class="dump-item a-${areaKey(r.area)} ${saved ? "saved" : ""}" role="listitem">
      ${saved ? `<span style="color:var(--color-success)">${ic("check")}</span>` : `<input type="checkbox" id="dump-${i}" data-dump="${i}" ${it.sel ? "checked" : ""} aria-label="Elegir: ${esc(r.titulo)}">`}
      <label class="row-main" for="dump-${i}"><span class="row-title">${esc(r.titulo)}</span><span class="row-meta"><span>${meta}</span>${it.missing.length && r.tipo !== "checkin" ? `<span class="soon">${ic("info","icon-16")}${esc(askFor(r, it.missing) || "")}</span>` : ""}</span></label>
      ${saved ? `<span class="caption">${esc(cap1(guardad(r.tipo)))}</span>` : `<button class="btn btn-text" data-act="dump-edit" data-i="${i}">${ic("pencil","icon-16")}Revisar</button>`}
    </div>`; }).join("")}</div>
    <div class="form-foot"><button class="btn btn-secondary" data-act="dump-clear">Empezar de nuevo</button><button class="btn btn-primary" data-act="dump-save" ${items.some(x => x.sel && !x.saved) ? "" : "disabled"}>${ic("check")}Guardar seleccionados</button></div>` : "";
  return `<form class="card dump" id="dump-form" novalidate>
    <div class="field"><label for="dump-text">¿Qué tienes en la cabeza?</label>
      <textarea class="textarea" id="dump-text" placeholder="El viernes entrego el avance de tesis, tengo que llamar al banco, comprar comida para los gatos, la reunión con el cliente es el martes a las 3 p. m. y quiero ir al gym 3 veces…" ${busy ? "disabled" : ""}>${esc(d.text)}</textarea>
      <span class="help">No se guarda nada hasta que elijas qué guardar.</span></div>
    <div class="cap-actions"><button type="submit" class="btn ${items.length ? "btn-secondary" : "btn-primary"}" ${busy ? "disabled" : ""}>${busy ? `<span class="spinner"></span>Ordenando…` : `${ic("capture")}${items.length ? "Volver a ordenar" : "Ordenar"}`}</button></div>
    ${busy ? `<div style="margin-top:20px">${loadingRows()}</div>` : list}
  </form>`;
}

/* ================= agenda ================= */
function viewAgenda(){
  const td = today();
  if (S.agenda.y === null) { const d = fromIso(td); S.agenda.y = d.getFullYear(); S.agenda.m = d.getMonth(); S.agenda.sel = td; }
  const { y, m, sel } = S.agenda;
  const first = new Date(y, m, 1), start = new Date(y, m, 1 - ((first.getDay() + 6) % 7));
  const byDay = {}; recs().filter(r => r.fecha && r.tipo !== "nota").forEach(r => (byDay[r.fecha] ||= []).push(r));
  Object.values(byDay).forEach(a => a.sort((p, q) => (isEventLike(q) - isEventLike(p)) || (p.hora || "99").localeCompare(q.hora || "99")));
  let cells = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i); const k = iso(d);
    if (i >= 35 && d.getMonth() !== m) break;
    const items = byDay[k] || [];
    cells += `<button class="day ${d.getMonth() !== m ? "out" : ""} ${k === td ? "today" : ""}" data-day="${k}" aria-pressed="${k === sel}" aria-label="${DOWL[d.getDay()]} ${d.getDate()} de ${MONL[d.getMonth()]}${items.length ? `, ${items.length} registro${items.length > 1 ? "s" : ""}` : ""}">
      <span class="dn">${d.getDate()}</span>
      ${items.slice(0, 3).map(r => `<span class="pill a-${areaKey(r.area)}">${r.hora ? fmtTime(r.hora) + " " : ""}${esc(r.titulo)}</span>`).join("")}
      ${items.length > 3 ? `<span class="caption">+${items.length - 3} más</span>` : ""}
      ${items.length ? `<span class="dots">${items.slice(0, 4).map(r => `<i class="a-${areaKey(r.area)}"></i>`).join("")}</span>` : ""}
    </button>`;
  }
  const dayItems = byDay[sel] || [], selD = fromIso(sel);
  return `
  <div class="page-head"><div><h1>Agenda</h1><p>Tus reuniones, eventos y fechas límite en un solo calendario, con el color de cada área.</p></div>
    <button class="btn btn-primary" data-act="new" data-tipo="evento">${ic("plus")}Agregar evento</button></div>
  <div class="ag-grid">
    <section class="card" aria-label="Calendario">
      <div class="cal-head"><h2>${MONL[m]} ${y}</h2>
        <button class="btn btn-text" data-act="cal-today">Hoy</button>
        <button class="icon-btn" data-act="cal-prev" aria-label="Mes anterior">${ic("left")}</button>
        <button class="icon-btn" data-act="cal-next" aria-label="Mes siguiente">${ic("right")}</button></div>
      <div class="cal">${["lun","mar","mié","jue","vie","sáb","dom"].map(x => `<span class="dow">${x}</span>`).join("")}${cells}</div>
      <div class="legend">${userAreas().map(k => `<span class="a-${k}"><i></i>${esc(AREAS[k])}</span>`).join("")}</div>
    </section>
    <section class="card" aria-labelledby="h-day">
      <div class="card-head"><h2 id="h-day">${sel === td ? "Hoy" : cap1(DOWL[selD.getDay()])}, ${selD.getDate()} de ${MONL[selD.getMonth()]}</h2></div>
      ${!S.loaded ? loadingRows() : dayItems.length ? `<div class="list">${dayItems.map(rowFor).join("")}</div>` : emptyState("calendar","Día libre","No tienes nada agendado para este día.")}
    </section>
  </div>`;
}

/* ================= tareas ================= */
function filteredTasks(){
  const t = S.tasks, q = norm(t.q.trim());
  return recs().filter(isTaskLike).filter(r => {
    if (q && !norm(r.titulo + " " + (r.descripcion || "")).includes(q)) return false;
    if (t.prioridad !== "todas" && r.prioridad !== t.prioridad) return false;
    if (t.area !== "todas" && areaKey(r.area) !== t.area) return false;
    if (t.meta !== "todas" && (r.meta_id || "") !== (t.meta === "sin" ? "" : t.meta)) return false;
    if (t.estado === "activas") return !isDone(r);
    if (t.estado === "pendiente") return r.estado === "pendiente" && !isLate(r);
    if (t.estado === "en_progreso") return r.estado === "en_progreso" && !isLate(r);
    if (t.estado === "vencidas") return isLate(r);
    if (t.estado === "completada") return isDone(r);
    return true;
  });
}
function sortTasks(list){
  const o = S.tasks.orden;
  return list.sort((a, b) => o === "prioridad"
    ? PRANK[a.prioridad] - PRANK[b.prioridad] || (a.fecha || "9999").localeCompare(b.fecha || "9999")
    : (a.fecha || "9999").localeCompare(b.fecha || "9999") || PRANK[a.prioridad] - PRANK[b.prioridad]);
}
function tasksListHTML(){
  if (!S.loaded) return `<div class="card">${loadingRows()}</div>`;
  const list = filteredTasks(), td = today();
  if (!list.length) {
    const any = recs().some(isTaskLike);
    return `<div class="card">${any ? emptyState("search","Sin resultados","Nada coincide con estos filtros. Prueba con otra búsqueda o quita algún filtro.",`<button class="btn btn-secondary" data-act="clear-filters">Quitar filtros</button>`)
      : emptyState("tasks","Aún no tienes tareas","¿Planificamos tu día? Escríbeme lo que necesitas hacer en Capturar.",`<a class="btn btn-secondary" href="#capturar">Ir a Capturar</a>`)}</div>`;
  }
  const groups = [
    ["Atrasadas", r => isLate(r)], ["Hoy y mañana", r => !isDone(r) && !isLate(r) && r.fecha && diffDays(r.fecha, td) <= 1],
    ["Próximas", r => !isDone(r) && r.fecha && diffDays(r.fecha, td) > 1], ["Sin fecha", r => !isDone(r) && !r.fecha], ["Completadas", isDone]
  ];
  return groups.map(([name, fn]) => { const g = sortTasks(list.filter(fn)); if (!g.length) return "";
    return `<section class="group"><div class="group-h"><h3>${name}</h3><span class="n">${g.length}</span></div><div class="card" style="padding-block:4px"><div class="list">${g.map(r => taskRow(r)).join("")}</div></div></section>`; }).join("");
}
function viewTareas(){
  const t = S.tasks, ts = recs().filter(isTaskLike);
  const cnt = { activas:ts.filter(r => !isDone(r)).length, pendiente:ts.filter(r => r.estado === "pendiente" && !isLate(r)).length, en_progreso:ts.filter(r => r.estado === "en_progreso" && !isLate(r)).length, vencidas:ts.filter(isLate).length, completada:ts.filter(isDone).length };
  const fl = [["activas","Por hacer"],["pendiente","Pendientes"],["en_progreso","En progreso"],["vencidas","Atrasadas"],["completada","Completadas"],["todas","Todas"]];
  const sel = (id, label, obj, v) => `<label class="sr" for="${id}">${label}</label><select class="select" id="${id}">${optsHTML(obj, v)}</select>`;
  const mo = { todas:"Toda meta", sin:"Sin meta" }; metas().forEach(m => mo[m.id] = m.titulo);
  return `
  <div class="page-head"><div><h1>Tareas</h1><p>Tareas y recordatorios, ordenados por fecha límite y prioridad.</p></div>
    <button class="btn btn-primary" data-act="new" data-tipo="tarea">${ic("plus")}Crear tarea</button></div>
  <div class="toolbar">
    <div class="filters" role="group" aria-label="Filtrar por estado">${fl.map(([k, n]) => `<button class="fchip" data-estado="${k}" aria-pressed="${t.estado === k}">${n}${cnt[k] !== undefined ? ` <span class="n">${cnt[k]}</span>` : ""}</button>`).join("")}</div>
    <div class="toolbar-row">
      <div class="search">${ic("search")}<label class="sr" for="t-q">Buscar tareas</label><input class="input" id="t-q" type="search" placeholder="Buscar tareas" value="${esc(t.q)}" autocomplete="off"></div>
      ${sel("t-prio","Prioridad",{ todas:"Toda prioridad", alta:"Prioridad alta", media:"Prioridad media", baja:"Prioridad baja" }, t.prioridad)}
      ${sel("t-area","Área",{ todas:"Toda área", ...areaOpts() }, t.area)}
      ${metas().length ? sel("t-meta","Meta", mo, t.meta) : ""}
      ${sel("t-orden","Ordenar por",{ fecha:"Ordenar por fecha", prioridad:"Ordenar por prioridad" }, t.orden)}
    </div>
  </div>
  <div id="t-list">${tasksListHTML()}</div>`;
}

/* ================= mi vida ================= */
function weekBalance(){
  const ws = weekStart(), we = addDays(ws, 6), c = {};
  recs().filter(r => { const d = r.fecha || isoDay(r.creado); return d >= ws && d <= we; }).forEach(r => { const a = areaKey(r.area); c[a] = (c[a] || 0) + 1; });
  checkins().filter(x => x.fecha >= ws && x.fecha <= we).forEach(x => { const m = S.docs.get(x.meta_id); const a = areaKey(m ? m.area : "personal"); c[a] = (c[a] || 0) + 1; });
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  return { c, total };
}
function balancePhrase(b){
  if (b.total < 5) return "";
  const top = Object.entries(b.c).sort((x, y) => y[1] - x[1])[0];
  if (top[1] / b.total < 0.7) return say("Tu semana está bastante repartida. Buen equilibrio.", "Semana equilibrada.");
  if (top[0] === "trabajo") return "Esta semana casi todo fue trabajo. ¿Te guardas un rato para ti?";
  if (top[0] === "estudios") return "Esta semana casi todo fue estudio. ¿Te guardas un rato para descansar?";
  return `Esta semana casi todo fue ${areaName(top[0]).toLowerCase()}. ¿Hay algo de otra área que quieras mover?`;
}
function viewMiVida(){
  const tab = S.vida.tab;
  const tabs = `<div class="tabs" role="tablist" aria-label="Mi vida">
    ${[["areas","Áreas y metas","layers"],["diario","Diario","pen"],["notas","Notas","note"]].map(([k, n, i]) => `<button class="tab" role="tab" data-vtab="${k}" aria-selected="${tab === k}">${ic(i,"icon-16")}${n}</button>`).join("")}</div>`;
  const head = `<div class="page-head"><div><h1>Mi vida</h1><p>Tu vida completa: tus áreas, tus metas, lo que piensas y tus apuntes.</p></div>
    ${tab === "areas" ? `<button class="btn btn-primary" data-act="new-meta">${esPlus() ? ic("plus") : ic("lock")}Crear meta</button>` : tab === "notas" ? `<button class="btn btn-primary" data-act="new" data-tipo="nota">${ic("plus")}Crear nota</button>` : ""}</div>`;
  if (!S.loaded) return head + tabs + `<div class="card">${loadingRows()}</div>`;
  const ro = !esPlus() && tab === "areas" ? `<div class="banner info">${ic("lock")}<div><b>Tus metas y hábitos están en solo lectura.</b> Todo sigue aquí. Para crear metas, editarlas o marcar "Hoy fui", necesitas Plus. <a href="#precios">Ver planes</a></div></div>` : "";
  return head + tabs + ro + (tab === "diario" ? viewDiario() : tab === "notas" ? viewNotas() : viewAreas());
}
function viewAreas(){
  const b = weekBalance(), ph = balancePhrase(b), areas = userAreas();
  const keys = Object.keys(b.c).sort((x, y) => AREA_ORDER.indexOf(x) - AREA_ORDER.indexOf(y));
  const recarga = memoria().filter(m => m.confirmado && (m.categoria === "gustos" || m.categoria === "personas_y_mascotas"));
  const cards = areas.map(a => {
    const ms = metas().filter(m => areaKey(m.area) === a && m.estado !== "lograda");
    const next = recs().filter(r => areaKey(r.area) === a && isTaskLike(r) && !isDone(r)).sort((x, y) => (x.fecha || "9999").localeCompare(y.fecha || "9999")).slice(0, 3);
    if (!ms.length && !next.length && a === "personal" && areas.length > 1 && !recarga.length) return "";
    return `<section class="card area-card a-${a}" aria-labelledby="h-a-${a}">
      <div class="card-head" style="margin:0"><h2 id="h-a-${a}">${esc(AREAS[a])}</h2><span class="caption num">${b.c[a] || 0} esta semana</span></div>
      <div class="stack-sm"><span class="overline">Metas</span>
        ${ms.length ? ms.map(m => { const n = m.tipo === "habito" ? weekCheckins(m).length : null, g = m.frecuencia_semanal || 1;
          return `<div class="mini-goal"><div class="row-inline" style="justify-content:space-between"><span style="font-weight:500">${esc(m.titulo)}</span><span class="caption num">${m.tipo === "habito" ? `${n} de ${g}` : m.fecha_objetivo ? fmtDate(m.fecha_objetivo) : "Proyecto"}${m.estado === "pausada" ? " · Pausada" : ""}</span></div>${m.tipo === "habito" ? `<div class="gbar"><i style="width:${Math.min(100, Math.round(n / g * 100))}%"></i></div>` : ""}</div>`; }).join("")
          : `<p class="caption">Sin metas en esta área. <button class="btn btn-text" data-act="new-meta" data-area="${a}" style="height:auto;padding:0">Crear una</button></p>`}</div>
      <div class="stack-sm"><span class="overline">Próximos pasos</span>
        ${next.length ? `<ul>${next.map(r => `<li>${ic(TIPOS[r.tipo].ic,"icon-16")}<span>${esc(r.titulo)}</span><span class="caption">${r.fecha ? esc(relDay(r.fecha)) : "Sin fecha"}</span></li>`).join("")}</ul>` : `<p class="caption">Nada pendiente aquí.</p>`}</div>
    </section>`; }).join("");
  const allGoals = metas().sort((x, y) => (x.estado === "activa" ? 0 : 1) - (y.estado === "activa" ? 0 : 1));
  return `
  <section class="card" aria-labelledby="h-bal" style="margin-bottom:var(--space-6)">
    <div class="card-head"><div><h2 id="h-bal">El balance de tu semana</h2><p class="caption">Cómo se reparten tus registros y check-ins por área, de lunes a domingo.</p></div></div>
    ${b.total ? `<div class="balance" role="img" aria-label="${esc(keys.map(k => `${AREAS[k]}: ${b.c[k]}`).join(", "))}">${keys.map(k => `<i class="a-${k}" style="flex:${b.c[k]}"></i>`).join("")}</div>
      <div class="legend">${keys.map(k => `<span class="a-${k}"><i></i>${esc(AREAS[k])} <b class="num">${b.c[k]}</b></span>`).join("")}</div>
      ${ph ? `<p style="margin-top:var(--space-4)">${esc(ph)}</p>` : ""}` : `<p class="caption">Todavía no hay registros esta semana.</p>`}
  </section>
  <section class="card" aria-labelledby="h-allg" style="margin-bottom:var(--space-6)">
    <div class="card-head"><h2 id="h-allg">Tus metas</h2></div>
    ${allGoals.length ? `<div class="goals">${allGoals.map(m => goalCard(m)).join("")}</div>` : emptyState("target","Aún no tienes metas","Un hábito, como ir al gym 3 veces por semana, o un proyecto con fecha, como terminar la tesis en junio.",`<button class="btn btn-secondary" data-act="new-meta">Crear meta</button>`)}
  </section>
  <div class="areas-grid">${cards}
    <section class="card area-card a-personal" aria-labelledby="h-rec">
      <h2 id="h-rec">Lo que te recarga</h2>
      ${recarga.length ? `<ul>${recarga.map(m => `<li>${ic("heart","icon-16")}<span>${esc(m.contenido)}</span></li>`).join("")}</ul>` : `<p class="caption">Cuéntame qué te hace feliz en tu diario o en tu cuenta, y te lo recordaré cuando cierres el día.</p>`}
      <a class="btn btn-text" href="#cuenta" style="align-self:flex-start">Ver lo que sé de ti</a>
    </section>
  </div>`;
}
function viewDiario(){
  const d = S.diary, busy = d.phase === "loading", r = d.reply;
  const entries = diario().sort((a, b) => (b.creado || "").localeCompare(a.creado || ""));
  let reply = "";
  if (r && r.riesgo) reply = careHTML();
  else if (r) reply = `<div class="reply" role="status">${logo()}<div class="tx"><p>${esc(r.respuesta)}</p>
    ${r.tareas.map((t, i) => t.done ? "" : `<div class="suggest"><p>Mencionaste <b>${esc(t.titulo)}</b>. ¿Lo agrego a tus pendientes?</p><button class="btn btn-secondary" data-act="dy-task" data-i="${i}">${ic("plus","icon-16")}Agregar</button><button class="btn btn-text" data-act="dy-task-no" data-i="${i}">No, gracias</button></div>`).join("")}
    ${r.recuerdos.map((m, i) => m.done ? "" : `<div class="suggest"><p>¿Quieres que recuerde que ${esc(m.contenido.charAt(0).toLowerCase() + m.contenido.slice(1))}?</p><button class="btn btn-secondary" data-act="dy-mem" data-i="${i}">${ic("check","icon-16")}Sí, recuérdalo</button><button class="btn btn-text" data-act="dy-mem-no" data-i="${i}">No</button></div>`).join("")}
    </div></div>`;
  return `
  <form class="card diary-form" id="diary-form" novalidate>
    <div class="field"><label for="dy-text" class="label" style="font-family:var(--font-heading);font-size:var(--fs-h2);line-height:1.4;font-weight:600;color:var(--color-ink)">¿Qué tienes en la cabeza?</label>
      <textarea class="textarea" id="dy-text" placeholder="Escribe con libertad. Esto es solo para ti." ${busy ? "disabled" : ""}>${esc(d.text)}</textarea></div>
    <div class="mood" role="group" aria-label="¿Cómo te sientes? (opcional)"><span class="caption" style="align-self:center">¿Cómo te sientes? (opcional)</span>${MOODS.map(m => `<button type="button" class="chipsel" data-mood="${esc(m)}" aria-pressed="${d.mood === m}">${esc(m)}</button>`).join("")}</div>
    <div class="cap-actions"><button type="submit" class="btn btn-primary" ${busy ? "disabled" : ""}>${busy ? `<span class="spinner"></span>Guardando…` : `${ic("pen")}Guardar entrada`}</button><span class="caption">${ic("lock","icon-16")} Tu diario es privado. Solo viaja a la IA la entrada que escribes ahora.</span></div>
    ${reply}
  </form>
  <section style="margin-top:var(--space-8)" aria-labelledby="h-entries"><h2 id="h-entries" style="margin-bottom:var(--space-4)">Tus entradas</h2>
    ${entries.length ? `<div class="entries">${entries.map(e => `<article class="card entry" data-diary="${esc(e.id)}"><div class="eh"><span class="overline">${esc(longDate(isoDay(e.creado)))}${e.estado_animo ? " · " + esc(e.estado_animo) : ""}</span>
      <button class="icon-btn" data-act="dy-del" data-id-d="${esc(e.id)}" aria-label="Eliminar entrada del ${esc(fmtDate(isoDay(e.creado)))}">${ic("trash")}</button></div><p class="body">${esc(e.contenido)}</p></article>`).join("")}</div>`
      : `<div class="card">${emptyState("pen","Todavía no has escrito","Cuando quieras soltar lo que piensas, este es tu lugar.")}</div>`}
  </section>`;
}
function careHTML(){
  return `<div class="care" role="alert" aria-labelledby="h-care"><h3 id="h-care">${ic("life")}Gracias por contármelo</h3>
    <p>Lo que sientes importa, y no tienes que cargarlo en soledad. Si puedes, habla hoy con alguien de confianza: una amiga, un familiar, alguien que te quiera.</p>
    <p>Y si sientes que estás en peligro o que podrías hacerte daño, busca ayuda ahora. Hay personas preparadas para escucharte:</p>
    <ul>
      <li><b>Línea 113 Salud (Minsa):</b> llama al <span class="num">113</span> y elige la opción de salud mental. Es gratuita y atiende las 24 horas, todos los días.</li>
      <li><b>WhatsApp de Infosalud:</b> <span class="num">955 557 000</span></li>
      <li><b>Emergencias (SAMU):</b> llama al <span class="num">106</span>.</li>
    </ul>
    <p class="caption">Tu entrada quedó guardada solo para ti. No voy a guardar nada de esto en lo que sé de ti.</p></div>`;
}
function notesHTML(){
  const q = norm(S.notes.q.trim());
  const notes = recs().filter(r => r.tipo === "nota").filter(r => !q || norm(r.titulo + " " + (r.descripcion || "")).includes(q))
    .sort((a, b) => (b.creado || "").localeCompare(a.creado || ""));
  if (!notes.length) return `<div class="card">${q ? emptyState("search","Sin resultados","Ninguna nota coincide con tu búsqueda.") : emptyState("note","Aún no tienes notas","Guarda ideas y apuntes. Por ejemplo, escribe en Capturar \"Nota: ideas para la presentación\".",`<button class="btn btn-secondary" data-act="new" data-tipo="nota">Crear nota</button>`)}</div>`;
  return `<div class="notes">${notes.map(r => `<article class="card note a-${areaKey(r.area)}" data-id="${esc(r.id)}">
    <span class="overline">${esc(areaName(r.area))}</span><h3>${esc(r.titulo)}</h3>
    ${r.descripcion ? `<p class="body">${esc(r.descripcion)}</p>` : ""}
    <div class="foot"><span class="caption num">${fmtDate(r.fecha || isoDay(r.creado))}</span>
      <button class="icon-btn" data-act="menu" aria-label="Más acciones para ${esc(r.titulo)}" aria-haspopup="menu">${ic("more")}</button></div></article>`).join("")}</div>`;
}
function viewNotas(){
  return `<div class="toolbar"><div class="toolbar-row"><div class="search">${ic("search")}<label class="sr" for="n-q">Buscar notas</label><input class="input" id="n-q" type="search" placeholder="Buscar notas por título o contenido" value="${esc(S.notes.q)}" autocomplete="off"></div></div></div>
  <div id="n-list">${notesHTML()}</div>`;
}
function viewBuscar(){
  const q = norm(S.gsearch.trim());
  const res = recs().filter(r => norm(r.titulo + " " + (r.descripcion || "")).includes(q)).sort((a, b) => (a.fecha || "9999").localeCompare(b.fecha || "9999"));
  const gs = metas().filter(m => norm(m.titulo).includes(q));
  return `<div class="page-head"><div><h1>Resultados</h1><p>${res.length + gs.length} ${res.length + gs.length === 1 ? "resultado" : "resultados"} para "${esc(S.gsearch.trim())}".</p></div>
    <button class="btn btn-secondary" data-act="clear-gsearch">${ic("x")}Limpiar búsqueda</button></div>
    ${gs.length ? `<section class="card" style="margin-bottom:var(--space-5)"><h2 style="margin-bottom:var(--space-4)">Metas</h2><div class="goals">${gs.map(m => goalCard(m)).join("")}</div></section>` : ""}
    <div class="card">${res.length ? `<div class="list">${res.map(rowFor).join("")}</div>` : emptyState("search","Sin resultados en tus registros","Prueba con otra palabra.")}</div>`;
}
