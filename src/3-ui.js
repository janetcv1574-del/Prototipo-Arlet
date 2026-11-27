
/* ================= piezas de UI ================= */
function statusChip(r){
  if (isLate(r)) return `<span class="chip st-vencida">${ic("alert")}Atrasada</span>`;
  if (r.estado === "completada") return `<span class="chip st-completada">${ic("check")}${isEventLike(r) ? "Realizada" : "Completada"}</span>`;
  if (r.estado === "confirmada") return `<span class="chip st-confirmada">${ic("check")}Confirmada</span>`;
  if (r.estado === "en_progreso") return `<span class="chip st-progreso">${ic("progress")}En progreso</span>`;
  return `<span class="chip st-pendiente">${ic("circle")}${isEventLike(r) ? "Por confirmar" : "Pendiente"}</span>`;
}
const prioChip = r => `<span class="chip pr-${r.prioridad}" title="Prioridad ${PRIOS[r.prioridad].toLowerCase()}">${ic("flag")}${PRIOS[r.prioridad]}</span>`;
const autoTag = r => r.origen === "auto" ? `<span class="auto-tag">${ic("capture","icon-16")}Guardado por Arlet</span>` : "";
function dateMeta(r){
  if (!r.fecha) return `<span>${ic("calendar","icon-16")}Sin fecha</span>`;
  const n = diffDays(r.fecha, today());
  let txt = fmtDate(r.fecha), cls = "";
  if (isLate(r)) { cls = "late"; txt = `Quedó ${n === -1 ? "de ayer" : "del " + fmtDate(r.fecha)}`; }
  else if (isSoon(r)) { cls = "soon"; txt = n === 0 ? "Vence hoy" : "Vence mañana"; }
  else if (isTaskLike(r) && !isDone(r)) txt = `Vence el ${fmtDate(r.fecha)}`;
  return `<span class="${cls}">${ic(cls === "late" ? "alert" : "calendar","icon-16")}<span class="num">${esc(txt)}</span></span>${r.hora ? `<span>${ic("clock","icon-16")}<span class="num">${fmtTime(r.hora)}</span></span>` : ""}`;
}
const metaName = id => { const m = id && S.docs.get(id); return m ? m.titulo : null; };
function taskRow(r){
  const done = isDone(r), mt = metaName(r.meta_id);
  const checkable = r.tipo !== "nota";
  return `<div class="row a-${areaKey(r.area)} ${done ? "done" : ""}" data-id="${esc(r.id)}">
    ${checkable ? `<button class="check ${done ? "on" : ""}" data-act="toggle" aria-label="${done ? "Volver a pendiente" : "Completar"}: ${esc(r.titulo)}">${done ? ic("check") : ""}</button>` : `<span style="width:24px;flex:none;color:var(--color-gray-500)">${ic("note")}</span>`}
    <div class="row-main">
      <span class="overline">${TIPOS[r.tipo].n} · ${esc(areaName(r.area))}</span>
      <span class="row-title">${esc(r.titulo)}</span>
      <div class="row-meta">${r.tipo === "nota" ? `<span>${ic("calendar","icon-16")}${esc(fmtDate(isoDay(r.creado)))}</span>` : dateMeta(r)}${mt ? `<span>${ic("target","icon-16")}${esc(mt)}</span>` : ""}</div>
    </div>
    <div class="row-tags">${autoTag(r)}${r.tipo !== "nota" ? prioChip(r) + statusChip(r) : ""}</div>
    <button class="icon-btn" data-act="menu" aria-label="Más acciones para ${esc(r.titulo)}" aria-haspopup="menu">${ic("more")}</button>
  </div>`;
}
function eventRow(r){
  const d = fromIso(r.fecha);
  return `<div class="row ev a-${areaKey(r.area)}" data-id="${esc(r.id)}">
    <div class="timebox"><span>${DOW[d.getDay()]}</span><b class="num">${d.getDate()}</b></div>
    <div class="row-main">
      <span class="overline">${TIPOS[r.tipo].n} · ${esc(areaName(r.area))}</span>
      <span class="row-title">${esc(r.titulo)}</span>
      <div class="row-meta"><span>${ic("clock","icon-16")}<span class="num">${r.hora ? fmtTime(r.hora) : "Sin hora"}</span></span><span>${esc(relDay(r.fecha))}</span></div>
    </div>
    <div class="row-tags">${autoTag(r)}${statusChip(r)}</div>
    <button class="icon-btn" data-act="menu" aria-label="Más acciones para ${esc(r.titulo)}" aria-haspopup="menu">${ic("more")}</button>
  </div>`;
}
const rowFor = r => isEventLike(r) && r.fecha ? eventRow(r) : taskRow(r);
const emptyState = (icon, title, text, action = "") => `<div class="empty">${ic(icon,"icon-32")}<p class="t">${title}</p><p>${text}</p>${action}</div>`;
const loadingRows = () => `<div class="skeleton" aria-label="Cargando"><i style="width:70%"></i><i style="width:90%"></i><i style="width:55%"></i></div>`;
const optsHTML = (obj, v) => Object.entries(obj).map(([k, n]) => `<option value="${esc(k)}" ${k === v ? "selected" : ""}>${esc(typeof n === "string" ? n : n.n)}</option>`).join("");
function areaOpts(v){ const o = {}; userAreas().forEach(k => o[k] = AREAS[k]); if (v && AREAS[v] && !o[v]) o[v] = AREAS[v]; return o; }
function metaOpts(){ const o = { "":"Sin meta" }; metas().filter(m => m.estado !== "lograda").forEach(m => o[m.id] = m.titulo); return o; }

function formHTML(px, d, { withEstado = false, errors = {}, ask = [] } = {}){
  const f = k => `${errors[k] ? "has-error" : ""} ${ask.includes(k) && !errors[k] ? "has-ask" : ""}`;
  const err = k => errors[k] ? `<span class="err" id="${px}-${k}-err">${ic("alert","icon-16")}${esc(errors[k])}</span>` : "";
  const isNote = d.tipo === "nota";
  return `<div class="form-grid">
    <div class="field ${f("titulo")} full"><label for="${px}-titulo">Título</label>
      <input class="input" id="${px}-titulo" value="${esc(d.titulo)}" maxlength="80" ${errors.titulo ? `aria-invalid="true" aria-describedby="${px}-titulo-err"` : ""}>${err("titulo")}</div>
    <div class="field"><label for="${px}-tipo">Tipo</label><select class="select" id="${px}-tipo">${optsHTML(TIPOS, d.tipo)}</select></div>
    <div class="field"><label for="${px}-area">Área</label><select class="select" id="${px}-area">${optsHTML(areaOpts(d.area), areaKey(d.area))}</select></div>
    <div class="field ${f("fecha")}"><label for="${px}-fecha">${isEventLike(d) ? "Fecha" : isNote ? "Fecha (opcional)" : "Fecha límite"}</label>
      <input class="input num" type="date" id="${px}-fecha" value="${d.fecha || ""}" ${errors.fecha ? `aria-invalid="true" aria-describedby="${px}-fecha-err"` : ""}>${err("fecha") || (ask.includes("fecha") ? `<span class="help">Falta este dato</span>` : "")}</div>
    <div class="field ${f("hora")}" ${isNote ? "hidden" : ""}><label for="${px}-hora">Hora${isEventLike(d) ? "" : " (opcional)"}</label>
      <input class="input num" type="time" id="${px}-hora" value="${d.hora || ""}">${ask.includes("hora") ? `<span class="help">Falta este dato</span>` : ""}</div>
    <fieldset class="field full" style="border:0;padding:0;margin:0" ${isNote ? "hidden" : ""}><legend class="label" style="margin-bottom:8px">Prioridad</legend>
      <div class="seg">${Object.entries(PRIOS).map(([k, n]) => `<input type="radio" name="${px}-prio" id="${px}-prio-${k}" value="${k}" ${d.prioridad === k ? "checked" : ""}><label for="${px}-prio-${k}">${n}</label>`).join("")}</div></fieldset>
    ${withEstado && !isNote ? `<div class="field"><label for="${px}-estado">Estado</label><select class="select" id="${px}-estado">${optsHTML(isEventLike(d) ? { confirmada:"Confirmada", pendiente:"Por confirmar", completada:"Realizada" } : { pendiente:"Pendiente", en_progreso:"En progreso", completada:"Completada" }, d.estado)}</select></div>` : ""}
    ${metas().length && !isNote ? `<div class="field"><label for="${px}-meta">Meta (opcional)</label><select class="select" id="${px}-meta">${optsHTML(metaOpts(), d.meta_id || "")}</select></div>` : ""}
    <div class="field full"><label for="${px}-desc">${isNote ? "Contenido" : "Descripción (opcional)"}</label>
      <textarea class="textarea" id="${px}-desc" maxlength="2000">${esc(d.descripcion)}</textarea></div>
  </div>`;
}
function readForm(px, base){
  const v = id => { const el = document.getElementById(`${px}-${id}`); return el ? el.value : undefined; };
  const pr = document.querySelector(`input[name="${px}-prio"]:checked`);
  const d = { ...base, titulo:v("titulo") ?? base.titulo, tipo:v("tipo") || base.tipo, area:v("area") || base.area,
    fecha:v("fecha") || null, hora:v("hora") || null, prioridad:pr ? pr.value : base.prioridad, descripcion:v("desc") ?? base.descripcion };
  const mt = v("meta"); if (mt !== undefined) d.meta_id = mt || null;
  const es = v("estado"); if (es) d.estado = es;
  if (d.tipo !== base.tipo && !es) d.estado = isEventLike(d) ? "confirmada" : "pendiente";
  if (d.tipo === "nota") d.hora = null;
  return d;
}
function validate(d, isNew){
  const e = {}, a = TIPOS[d.tipo].art;
  if (!d.titulo || !d.titulo.trim()) e.titulo = `Agrega un nombre para ${a}.`;
  if (isEventLike(d) && !d.fecha) e.fecha = `Agrega la fecha de ${a}.`;
  if (isNew && d.fecha && d.fecha < today() && d.tipo !== "nota") e.fecha = "Esa fecha ya pasó. Elige hoy o una fecha futura.";
  return e;
}
function conflictOf(d, selfId){
  if (!isEventLike(d) || !d.fecha || !d.hora) return null;
  return recs().find(r => r.id !== selfId && isEventLike(r) && r.fecha === d.fecha && r.hora === d.hora && r.estado !== "completada") || null;
}

/* ================= navegación ================= */
const NAV = [
  { id:"inicio", n:"Inicio", ic:"home" }, { id:"capturar", n:"Capturar", ic:"capture" },
  { id:"agenda", n:"Agenda", ic:"calendar" }, { id:"tareas", n:"Tareas", ic:"tasks" }, { id:"mi-vida", n:"Mi vida", ic:"layers" }
];
const PRIVATE = ["inicio","capturar","agenda","tareas","mi-vida","cuenta","admin","bienvenida"];
function renderNav(){
  const L = S.loaded;
  const c = { tareas: recs().filter(r => isTaskLike(r) && !isDone(r)).length, agenda: recs().filter(r => isEventLike(r) && r.fecha && r.fecha >= today()).length };
  const extra = S.canEdit ? `<div class="sep"></div><a href="#admin" ${S.view === "admin" ? 'aria-current="page"' : ""}>${ic("shield")}Administración</a>` : "";
  $("#snav").innerHTML = NAV.map(n => `<a href="#${n.id}" ${S.view === n.id ? 'aria-current="page"' : ""}>${ic(n.ic)}${n.n}${c[n.id] && L ? `<span class="count num">${c[n.id]}</span>` : ""}</a>`).join("") + extra;
  $("#bnav").innerHTML = NAV.map(n => `<a href="#${n.id}" ${S.view === n.id ? 'aria-current="page"' : ""}>${ic(n.ic,"icon-24")}${n.n}</a>`).join("");
  const nm = nombre(), ini = (nm || "T").charAt(0).toUpperCase();
  $("#me-side").innerHTML = S.auth === "ok" ? `<a class="me" href="#cuenta"><span class="av" aria-hidden="true">${esc(ini)}</span><span style="min-width:0"><span class="nm" style="display:block">${esc(nm || "Tu cuenta")}</span><span class="sub">Tu cuenta y lo que sé de ti</span></span></a>` : "";
  $("#avatar-top").textContent = ini;
  $("#brand-side").innerHTML = brand(); $("#brand-top").innerHTML = brand();
  const ready = recs().filter(r => isEventLike(r) && r.fecha && r.fecha >= today()).length;
  $("#gcal").innerHTML = `<div class="t">${ic("calendar","icon-16")}Google Calendar</div>
    <p>No conectado. ${ready ? `${ready} ${ready === 1 ? "evento quedará listo" : "eventos quedarán listos"} para sincronizarse cuando lo conectes.` : "Podrás conectar tu calendario personal y el del trabajo."}</p>
    <button type="button" disabled aria-describedby="gcal-note">Conectar Google Calendar</button><span class="caption" id="gcal-note" style="color:#9DB0C8">Parte de Plus · Disponible próximamente</span>`;
}
function syncHTML(){
  const m = { loading:["busy","sync","Cargando…"], saving:["busy","sync","Guardando…"], saved:["ok","cloud","Guardado"],
    local:["warn","device", window.ARLET_WEB ? "Guardado en este navegador" : "Solo en este navegador"], offline:["warn","cloudoff","Sin conexión"], error:["err","alert","No sincronizado"] }[S.sync] || ["ok","cloud","Guardado"];
  const title = { offline:"No hay conexión. Guardamos tus cambios y los sincronizaremos al reconectarte.", local: window.ARLET_WEB ? "Tus datos se guardan solo en este navegador y en este dispositivo." : "Abriste Arlet fuera de claude.ai: tus datos se guardan solo en este navegador.", error:"Algo falló al sincronizar. Intenta de nuevo en unos minutos." }[S.sync] || m[2];
  return `<span class="sync ${m[0]}" title="${esc(title)}">${ic(m[1])}<span class="lbl">${m[2]}</span></span>`;
}
function renderSync(){ $("#sync-side").innerHTML = syncHTML(); $("#sync-top").innerHTML = syncHTML(); }

/* ================= portada pública ================= */
function nextThursday(){ const td = today(), cur = fromIso(td).getDay(); return addDays(td, ((4 - cur + 7) % 7) || 7); }
const signedIn = () => S.auth === "ok";
function lpFooter(){
  return `<footer class="lp-footer"><div class="lp-wrap"><span>Arlet · Tu mano derecha</span><nav aria-label="Legal"><a href="#precios">Precios</a><a href="#privacidad">Privacidad</a><a href="#terminos">Términos</a></nav></div></footer>`;
}
function viewPortada(){
  const go = `<a class="lp-btn pri" href="${signedIn() ? "#inicio" : "#ingresar"}">${signedIn() ? "Entrar a mi espacio" : "Empezar"}${ic("arrow")}</a>`;
  return `
  <section class="lp-hero"><div class="lp-wrap">
    <nav class="lp-nav" aria-label="Arlet"><a class="brand" href="#portada">${brand()}</a>
      <span class="row-inline"><a class="lp-link" href="#precios">Precios</a><a class="lp-btn gho" href="${signedIn() ? "#inicio" : "#ingresar"}">${signedIn() ? (nombre() ? "Hola, " + esc(nombre()) : "Mi espacio") : "Iniciar sesión"}</a></span></nav>
    <div class="lp-grid">
      <div>
        <h1>Todo lo que llevas en la cabeza, en un solo lugar.</h1>
        <p class="lp-lead">Arlet es tu mano derecha para que el trabajo, los estudios y tu vida encajen. Le escribes como a alguien de confianza: ordena tus pendientes, recuerda tus metas y, con el tiempo, te conoce tanto que ya no tiene que preguntarte todo.</p>
        <div class="lp-acts">${go}<a class="lp-btn gho" href="#como-funciona" data-act="scroll-how">Ver cómo funciona</a></div>
        <p class="lp-note">Tú decides cuánto hace Arlet por su cuenta.</p>
      </div>
      <div class="lp-demo" aria-label="Ejemplo de captura en Arlet">
        <div class="lp-typed">${ic("capture")}<div><span class="lbl">¿Qué necesitas organizar?</span>Tengo reunión con el equipo el jueves a las 10 a. m. para revisar los avances del proyecto<span class="lp-caret" aria-hidden="true"></span></div></div>
        <div class="lp-down">${ic("arrow")}Arlet lo ordena por ti</div>
        <div class="lp-conf">
          <div class="c-head"><h3>Revisa antes de guardar</h3><span class="ai-badge">${ic("capture","icon-16")}Interpretado con IA</span></div>
          <div class="lp-fields">
            <div class="lp-f full"><span>Título</span><b>Reunión con el equipo</b></div>
            <div class="lp-f"><span>Tipo</span><b>Reunión</b></div><div class="lp-f"><span>Área</span><b>Trabajo</b></div>
            <div class="lp-f"><span>Fecha</span><b>${fmtDate(nextThursday())}</b></div><div class="lp-f"><span>Hora</span><b>10:00 a. m.</b></div>
            <div class="lp-f full"><span>Descripción</span><b>Revisar los avances del proyecto</b></div>
          </div>
          <div class="lp-foot"><span class="lp-fake sec">Descartar</span><span class="lp-fake pri">Confirmar y guardar</span></div>
        </div>
        <p class="lp-sample">Ejemplo ilustrativo</p>
      </div>
    </div>
  </div></section>

  <section class="lp-sec" aria-labelledby="lp-who"><div class="lp-wrap">
    <div class="lp-h"><h2 id="lp-who">Para quienes llevan varias vidas a la vez</h2>
      <p>Si tus pendientes están repartidos entre el chat del trabajo, el aula virtual, el calendario y notas sueltas en el celular, Arlet los junta en un solo lugar, junto con tus metas.</p></div>
    <div class="lp-who">
      <article class="card lp-card"><span class="lp-tag"><i style="--c:var(--area-trabajo)"></i>Trabajo</span><h3>Reuniones, entregables y pedidos de último minuto</h3>
        <p>Lo que no quieres que se te escape, con su fecha y su prioridad.</p><p class="lp-ex">Por ejemplo: <q>Enviar el informe al cliente el viernes</q></p></article>
      <article class="card lp-card"><span class="lp-tag"><i style="--c:var(--area-estudios)"></i>Estudios</span><h3>Tesis, cursos y prácticas que se cruzan</h3>
        <p>Entregas y avances conectados a lo que quieres lograr este ciclo.</p><p class="lp-ex">Por ejemplo: <q>Entregar avance de tesis el viernes</q></p></article>
      <article class="card lp-card"><span class="lp-tag"><i style="--c:var(--area-personal)"></i>Tu vida</span><h3>El gym, los viajes, tus mascotas y tu gente</h3>
        <p>Lo que te recarga también tiene lugar, y Arlet te lo recuerda.</p><p class="lp-ex">Por ejemplo: <q>Ir al gym 3 veces esta semana</q></p></article>
    </div>
  </div></section>

  <section class="lp-sec alt" id="como-funciona" aria-labelledby="lp-how"><div class="lp-wrap">
    <div class="lp-h"><h2 id="lp-how">Cómo funciona</h2><p>Tres pasos, sin formularios largos.</p></div>
    <ol class="lp-steps">
      <li><h3>Cuéntale de ti</h3><p>Una pequeña entrevista de unos 3 minutos para que Arlet sepa qué te importa: tus áreas, tus metas y tu semana.</p></li>
      <li><h3>Escríbele como hablas</h3><p>Tareas, reuniones, metas o lo que tengas en la cabeza. Arlet propone la fecha, la hora y la prioridad, y te pregunta lo que falte.</p></li>
      <li><h3>Deja que te conozca</h3><p>Aprende de tus respuestas y correcciones, y cada vez te pide menos confirmaciones. Solo si tú quieres.</p></li>
    </ol>
  </div></section>

  <section class="lp-sec" aria-labelledby="lp-what"><div class="lp-wrap">
    <div class="lp-h"><h2 id="lp-what">Lo que tienes con Arlet</h2></div>
    <div class="lp-feats">
      <div class="card lp-feat"><span class="ic">${ic("home")}</span><div><h3>Tu día en un vistazo</h3><p>Al entrar ves lo que vence hoy, tus reuniones y lo que quedó pendiente, con un saludo que te conoce.</p></div></div>
      <div class="card lp-feat"><span class="ic">${ic("layers")}</span><div><h3>Tu vida completa</h3><p>Tus metas, tus áreas de vida y lo que te recarga, con el balance de tu semana.</p></div></div>
      <div class="card lp-feat"><span class="ic">${ic("pen")}</span><div><h3>Un lugar para soltar lo que piensas</h3><p>Un diario privado. Si mencionas algo pendiente, Arlet te pregunta si lo agrega.</p></div></div>
      <div class="card lp-feat you"><span class="ic">${ic("flag")}</span><div><h3>Tú decides</h3><p>Puedes ver y borrar todo lo que Arlet sabe de ti, y elegir cuánta autonomía le das. No lee tu correo ni tus chats.</p></div></div>
    </div>
  </div></section>

  <section class="lp-sec alt" id="precios-portada" aria-labelledby="lp-price"><div class="lp-wrap">
    <div class="lp-h"><h2 id="lp-price">Planes</h2><p>Empieza gratis y, al terminar la entrevista, prueba Plus ${ARLET_CONFIG.prueba.dias} días sin tarjeta.</p></div>
    ${pricingHTML()}
    <div class="lp-h" style="margin-top:var(--space-12);margin-bottom:var(--space-5)"><h3 style="font-size:20px">¿Qué pasa con mis datos si cancelo?</h3><p>${esc(FAQ[0][1])} <a href="#precios">Ver todas las preguntas</a></p></div>
  </div></section>
  <section class="lp-cta" aria-labelledby="lp-cta"><div class="lp-wrap lp-cta-in">
    <div><h2 id="lp-cta">Empieza a ordenar tu semana, y tu vida</h2><p>Escribe lo primero que tengas en la cabeza y mira cómo Arlet lo ordena.</p></div>${go}
  </div></section>
  ${lpFooter()}`;
}
function viewIngresar(){
  if (S.auth === "checking") return `<div class="lp-wrap"><section class="card auth" aria-live="polite"><div class="checking"><span class="spinner"></span>Verificando tu sesión…</div></section></div>`;
  return `<div class="lp-wrap"><a class="brand auth-brand" href="#portada">${brand()}</a><section class="card auth" aria-labelledby="h-auth">
    <span class="lock">${ic("lock","icon-24")}</span>
    <h1 id="h-auth">Entra con tu cuenta de Claude</h1>
    <p>Arlet usa tu cuenta de Claude para crear tu espacio privado. Tus tareas, tu diario y lo que Arlet sabe de ti solo los ves tú.</p>
    <ol><li>Inicia sesión en Claude con el correo al que te llegó la invitación.</li><li>Vuelve a abrir este enlace.</li></ol>
    <p class="caption">Por ahora Arlet está en prueba con acceso por invitación. Si no tienes una, pídela a quien te compartió el enlace.</p>
    <div class="acts"><a class="btn btn-primary" href="https://claude.ai/login" target="_blank" rel="noopener">Iniciar sesión en Claude</a><a class="btn btn-secondary" href="#portada">Volver a la portada</a></div>
  </section></div>`;
}
function viewPausada(){
  return `<div class="lp-wrap"><a class="brand auth-brand" href="#portada">${brand()}</a><section class="card auth" aria-labelledby="h-p">
    <span class="lock">${ic("pause","icon-24")}</span><h1 id="h-p">Tu cuenta está pausada</h1>
    <p>Escríbenos a <b>${esc(ARLET_CONFIG.soporte)}</b> si crees que es un error.</p>
    <div class="acts"><a class="btn btn-secondary" href="#portada">Volver a la portada</a></div></section></div>`;
}
function view404(){
  return `<div class="lp-wrap"><a class="brand auth-brand" href="#portada">${brand()}</a><section class="card auth" aria-labelledby="h-404">
    <span class="lock">${ic("search","icon-24")}</span><h1 id="h-404">No encontramos esta página</h1>
    <p>Puede que el enlace esté incompleto. Vuelve a tu espacio y sigue desde ahí.</p>
    <div class="acts"><a class="btn btn-primary" href="#inicio">Ir a mi espacio</a></div></section></div>`;
}
function viewLegal(which){
  const priv = which === "privacidad";
  const body = priv ? `
    <h1>Privacidad</h1><span class="chip st-pronto draft-note">${ic("alert")}Borrador para revisión legal</span>
    <p>Esta página explica, en lenguaje simple, qué hace Arlet con tu información. Es un borrador y debe revisarlo una persona especializada antes de lanzar Arlet al público.</p>
    <h2>Lo que guardamos</h2><ul><li>Tus registros: tareas, reuniones, eventos, recordatorios y notas.</li><li>Tus metas y tus check-ins.</li><li>Tu diario.</li><li>Lo que Arlet sabe de ti: los recuerdos que tú confirmaste.</li><li>Tu perfil: cómo te gusta que te llamen, tus áreas, tu rutina, el tono y el nivel de autonomía.</li></ul>
    ${window.ARLET_WEB ? `<h2>Dónde se guarda</h2><p>En esta versión web, todo se guarda <b>solo en este navegador</b>, en este dispositivo. No hay cuentas: nadie más, ni la administradora de Arlet, puede verlo. Si borras los datos del navegador o cambias de dispositivo, no se recuperan.</p>`
      : `<h2>Quién lo ve</h2><p>Solo tú. Tus datos viven en un espacio privado ligado a tu cuenta. Ni la administradora de Arlet puede leer tus registros, tu diario ni tu memoria. El panel de administración solo muestra datos de cuenta (fechas de registro y de último acceso) y conteos.</p>`}
    <h2>Lo que se envía a la IA</h2><p>Para entender lo que escribes, Arlet envía a la IA${window.ARLET_WEB ? " (Claude, de Anthropic, a través del servidor de Arlet, que no lo guarda)" : ""} el texto que estás procesando y un resumen de lo que sabe de ti y ya confirmaste. Nunca envía tu diario completo: cuando escribes en el diario, solo viaja esa entrada.</p>
    <h2>Tú decides</h2><ul><li>Arlet no guarda un recuerdo nuevo sin preguntarte.</li><li>Puedes ver, editar o borrar cada recuerdo en "Lo que Arlet sabe de ti". Lo que borras deja de usarse de inmediato.</li><li>Puedes eliminar tu cuenta y todos tus datos desde tu perfil.</li><li>Arlet no lee tu correo ni tus chats.</li></ul>
    <h2>Tu plan y tus pagos</h2><ul><li>Guardamos tu plan, sus fechas y cuántas capturas con IA usaste en el mes, para saber qué incluye tu cuenta.</li><li>Cuando haya cobros reales, el pago lo procesará un proveedor de pagos (por ejemplo, Mercado Pago). Arlet no guardará los datos de tu tarjeta.</li><li>Si cancelas o vuelves a Gratis, tus datos no se borran: se quedan contigo.</li></ul>
    <h2>Si escribes algo que nos preocupa</h2><p>Si una entrada del diario sugiere que estás en riesgo, Arlet te muestra líneas de ayuda. Eso no se guarda en tu memoria.</p>`
  : `
    <h1>Términos</h1><span class="chip st-pronto draft-note">${ic("alert")}Borrador para revisión legal</span>
    <p>Estos términos son un borrador y deben revisarse antes de lanzar Arlet al público.</p>
    <h2>Qué es Arlet</h2><p>Arlet es una herramienta para organizar tu trabajo, tus estudios y tu vida personal. Es una versión de prueba con acceso por invitación.</p>
    <h2>Tu cuenta</h2><ul><li>Entras con tu cuenta de Claude. Eres responsable de lo que guardas en tu espacio.</li><li>Una administradora puede pausar una cuenta si se usa de forma indebida.</li></ul>
    <h2>La IA puede equivocarse</h2><p>Arlet propone fechas, prioridades y áreas, pero puede equivocarse. Revisa lo importante. Arlet no reemplaza a un profesional de salud, legal ni financiero.</p>
    <h2>Planes y suscripción</h2><ul>
      <li>Arlet tiene un plan Gratis y planes de pago (Plus, Plus Estudiante y Oferta de fundadora). Los precios están en soles e incluyen IGV, y se muestran en la página de precios.</li>
      <li><b>Prueba gratis:</b> al terminar la entrevista inicial tienes ${ARLET_CONFIG.prueba.dias} días de Plus, sin pedir tarjeta. Se da una sola vez por cuenta. Si al terminar no eliges un plan, pasas a Gratis.</li>
      <li><b>Renovación automática:</b> los planes de pago se renuevan solos al final de cada periodo (mensual o anual) hasta que los canceles. La Oferta de fundadora cuesta ${soles(ARLET_CONFIG.planes.fundadora.primer_anio)} el primer año y luego se renueva a ${soles(ARLET_CONFIG.planes.fundadora.renueva_anual)} al año. Plus Estudiante requiere volver a verificar tu correo universitario cada ${ARLET_CONFIG.planes.estudiante.reverificar_meses} meses.</li>
      <li><b>Cancelación:</b> puedes cancelar cuando quieras desde tu cuenta, sin llamadas. Mantienes Plus hasta el fin del periodo que ya pagaste y no se te vuelve a cobrar.</li>
      <li><b>Pago fallido:</b> si un pago no pasa, te avisamos y mantienes Plus ${ARLET_CONFIG.gracia_dias} días más. Si no se resuelve, pasas a Gratis.</li>
      <li><b>Tus datos:</b> al volver a Gratis no pierdes nada. Lo que es de Plus queda en solo lectura.</li>
      <li>Por ahora Arlet está en versión de prueba y no realiza cobros reales.</li></ul>
    <h2>Lo que no hace</h2><ul><li>No lee tu correo ni tus chats.</li><li>No guarda los datos de tu tarjeta.</li><li>No actúa fuera de Arlet sin tu confirmación.</li></ul>
    <h2>Contacto</h2><p>Escríbenos a <b>${esc(ARLET_CONFIG.soporte)}</b>.</p>`;
  return `<div class="lp-wrap"><a class="brand auth-brand" href="#portada">${brand()}</a></div><article class="simple">${body}<p><a class="btn btn-secondary" href="#portada">Volver a la portada</a></p></article>${lpFooter()}`;
}

/* ================= precios ================= */
function pricingHTML(){
  const C = ARLET_CONFIG, P = C.planes, ef = signedIn() && perfil() ? planEf() : null, per = S.precioPeriodo;
  const cur = id => ef && ef.plus && ef.estado !== "prueba" && (ef.id === id || (id === "plus" && ef.era_fundadora)) ;
  const cta = (id, label) => !signedIn() ? `<a class="btn ${id === "plus" ? "btn-primary" : "btn-secondary"}" href="#ingresar">${label}</a>`
    : cur(id) ? `<span class="chip st-completada" style="align-self:flex-start">${ic("check")}Tu plan actual</span>`
    : `<button class="btn ${id === "plus" ? "btn-primary" : "btn-secondary"}" data-act="elegir-plan" data-plan="${id}">${label}</button>`;
  const li = a => `<ul class="pr-list">${a.map(x => `<li>${ic("check","icon-16")}<span>${x}</span></li>`).join("")}</ul>`;
  const cuposTxt = S.cupos == null ? `Solo para las primeras ${P.fundadora.cupos} cuentas.` : S.cupos >= P.fundadora.cupos ? "Ya no quedan cupos." : `Quedan <b class="num">${P.fundadora.cupos - S.cupos}</b> de ${P.fundadora.cupos} cupos.`;
  const agotado = S.cupos != null && S.cupos >= P.fundadora.cupos;
  return `<div class="prices">
    <article class="card price">
      <h3>${P.gratis.nombre}</h3><p class="amount"><b class="num">${soles(0)}</b></p><p class="caption">Para empezar a ordenar tu semana.</p>
      ${li(["Tareas, agenda y notas", "\"Tu día\" al entrar", "Entrevista inicial y memoria básica", `${P.gratis.capturas_mes} capturas con IA al mes`, "Te pregunto todo antes de guardar", "Mi vida y propuestas del diario para ver"])}
      ${!signedIn() ? cta("gratis", "Empezar gratis") : ef && !ef.plus ? `<span class="chip st-completada" style="align-self:flex-start">${ic("check")}Tu plan actual</span>` : ""}
    </article>
    <article class="card price featured">
      <span class="pr-badge">Recomendado</span>
      <h3>${P.plus.nombre}</h3>
      <div class="seg pr-toggle" role="group" aria-label="Forma de pago">
        <button type="button" class="fchip" data-act="precio-per" data-val="mensual" aria-pressed="${per === "mensual"}">Mensual</button>
        <button type="button" class="fchip" data-act="precio-per" data-val="anual" aria-pressed="${per === "anual"}">Anual</button></div>
      <p class="amount"><b class="num">${soles(per === "anual" ? P.plus.anual : P.plus.mensual)}</b><span>${per === "anual" ? "al año" : "al mes"}</span></p>
      <p class="caption">${per === "anual" ? `Ahorras ${soles(PL.ahorroAnual())} al año frente al plan mensual.` : `O ${soles(P.plus.anual)} al año y ahorras ${soles(PL.ahorroAnual())}.`}</p>
      ${li(["Todo lo de Gratis", "Captura con IA sin contar", "Guardo directo lo que tengo claro (niveles 2 y 3)", "Memoria completa: aprendo de tus correcciones y tu diario", "Mi vida completo: metas, hábitos y balance", "Propuestas del diario", "Google Calendar con varias cuentas (próximamente)"])}
      ${cta("plus", ef && ef.plus && ef.estado === "prueba" ? "Seguir con Plus" : "Elegir Plus")}
    </article>
    <article class="card price">
      <h3>${P.estudiante.nombre}</h3><p class="amount"><b class="num">${soles(P.estudiante.mensual)}</b><span>al mes</span></p><p class="caption">Todo Plus, con tu correo universitario verificado.</p>
      ${li(["Todo lo de Plus", "Se verifica con un código en tu correo universitario", `Lo renuevas cada ${P.estudiante.reverificar_meses} meses`])}
      ${cta("estudiante", "Verificar mi correo")}
    </article>
    <article class="card price">
      <h3>${P.fundadora.nombre}</h3><p class="amount"><b class="num">${soles(P.fundadora.primer_anio)}</b><span>el primer año</span></p><p class="caption">Luego ${soles(P.fundadora.renueva_anual)} al año. ${cuposTxt}</p>
      ${S.cupos != null ? `<div class="gbar" role="progressbar" aria-label="Cupos de fundadora usados" aria-valuemin="0" aria-valuemax="${P.fundadora.cupos}" aria-valuenow="${S.cupos}" style="height:8px;border-radius:999px;background:var(--color-gray-100);overflow:hidden"><i style="display:block;height:100%;width:${Math.min(100, S.cupos / P.fundadora.cupos * 100)}%;background:var(--color-primary-600)"></i></div>` : ""}
      ${li(["Todo lo de Plus", "Precio especial por confiar desde el inicio"])}
      ${agotado ? `<span class="caption">Cupos agotados</span>` : cta("fundadora", "Quiero ser fundadora")}
    </article>
  </div>
  <p class="caption pr-igv">Precio incluye IGV.${C.modo_demo ? " Versión de prueba: todavía no hacemos cobros reales." : ""}</p>`;
}
const FAQ = [
  ["¿Qué pasa con mis datos si cancelo?", "Se quedan contigo. Todo sigue guardado y visible. Lo que es de Plus, como tus metas, hábitos y lo que aprendí de ti, pasa a solo lectura hasta que vuelvas."],
  ["¿Necesito tarjeta para la prueba?", `No. Al terminar la entrevista tienes ${ARLET_CONFIG.prueba.dias} días de Plus sin dar ningún dato de pago.`],
  ["¿Puedo cancelar cuando quiera?", "Sí, desde tu cuenta, con un botón y sin llamadas. Mantienes Plus hasta el fin del periodo que ya pagaste."],
  ["¿Se renueva solo?", "Sí. Plus se renueva cada mes o cada año según tu plan, hasta que lo canceles. Te avisaré si un pago no pasa."],
  ["¿Los precios incluyen IGV?", "Sí, todos los precios están en soles e incluyen IGV."]
];
const faqHTML = () => `<div class="faq">${FAQ.map(([q, a]) => `<details class="card"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`;
function viewPrecios(){
  return `<div class="lp-wrap"><a class="brand auth-brand" href="#portada">${brand()}</a></div>
  <section class="lp-sec" style="padding-top:var(--space-8)" aria-labelledby="h-pr"><div class="lp-wrap">
    <div class="lp-h"><h1 id="h-pr" style="font-size:var(--fs-display);line-height:1.2">Elige cómo quieres que te acompañe</h1><p>Empieza gratis. Cuando quieras que haga más por ti, Plus está aquí. Tú decides.</p></div>
    ${pricingHTML()}
    <div class="lp-h" style="margin-top:var(--space-12)"><h2>Preguntas frecuentes</h2></div>${faqHTML()}
  </div></section>${lpFooter()}`;
}
