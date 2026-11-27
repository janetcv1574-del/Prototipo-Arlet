

/* ================= render y rutas ================= */
const PUBLIC_VIEWS = ["portada","ingresar","privacidad","terminos","precios"];
const ALL_VIEWS = [...PUBLIC_VIEWS, ...PRIVATE];
function resolveView(){
  const v = S.view;
  if (PUBLIC_VIEWS.includes(v) && v !== "ingresar") return v;
  if (!signedIn()) return "ingresar";
  if (v === "ingresar") return "inicio";
  if (S.cuentaEstado === "suspendida") return "pausada";
  if (v === "admin" && !S.canEdit) return "404";
  if (!ALL_VIEWS.includes(v)) return "404";
  const p = perfil();
  if (v !== "bienvenida" && v !== "cuenta" && v !== "admin" && S.loaded && p && !p.onboarding_completo && !p.onboarding_saltado) return "bienvenida";
  if (S.gsearch.trim() && !["capturar","bienvenida","admin","cuenta"].includes(v)) return "buscar";
  return v;
}
const VIEWS = { portada:viewPortada, ingresar:viewIngresar, privacidad:() => viewLegal("privacidad"), terminos:() => viewLegal("terminos"), precios:viewPrecios, pausada:viewPausada, "404":view404,
  bienvenida:viewBienvenida, inicio:viewInicio, capturar:viewCapturar, agenda:viewAgenda, tareas:viewTareas, "mi-vida":viewMiVida, cuenta:viewCuenta, admin:viewAdmin, buscar:viewBuscar };
let pendingRender = false, lastView = null;
function render(){
  pendingRender = false;
  const a = document.activeElement, aid = a && a.id, sel = a && "selectionStart" in a ? (() => { try { return [a.selectionStart, a.selectionEnd]; } catch(e) { return null; } })() : null;
  const v = resolveView();
  const pub = ["portada","ingresar","privacidad","terminos","precios","pausada","404","bienvenida"].includes(v);
  $(".app").classList.toggle("public", pub);
  $("#main").innerHTML = VIEWS[v]();
  renderNav(); renderSync(); fillNames();
  if (v !== lastView) { lastView = v; return; }
  if (aid && aid !== "main") { const el = document.getElementById(aid); if (el && el !== document.activeElement) { el.focus({ preventScroll:true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch(e){} } }
}
const typing = () => { const a = document.activeElement; return a && $("#main").contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== "checkbox" && a.type !== "radio"; };
function softRender(){ if (typing()) { pendingRender = true; renderNav(); renderSync(); return; } render(); }
document.addEventListener("focusout", () => { if (pendingRender) setTimeout(() => { if (pendingRender && !typing()) render(); }, 300); });
function route(){
  const h = decodeURIComponent(location.hash.replace("#", ""));
  closeLayer();
  if (h === "como-funciona") { S.view = "portada"; render(); document.getElementById("como-funciona")?.scrollIntoView(); return; }
  S.view = ALL_VIEWS.includes(h) ? h : h ? "404" : "portada";
  if (S.view === "bienvenida") S.ob = null;
  if (S.view === "cuenta") S.acc = { editMem:null, form:null };
  render(); window.scrollTo(0, 0);
  $("#main").focus({ preventScroll:true });
}
const go = h => { if (location.hash === "#" + h) route(); else location.hash = "#" + h; };

/* ================= capas: menú, modales, toasts ================= */
function closeLayer(){ $("#layer").innerHTML = ""; }
function modal(inner, sm = false, label = "md-h"){
  $("#layer").innerHTML = `<div class="scrim" data-act="scrim"><div class="modal ${sm ? "sm" : ""}" role="dialog" aria-modal="true" aria-labelledby="${label}">${inner}</div></div>`;
  ($("#layer input, #layer select, #layer textarea") || $("#layer .btn-secondary") || $("#layer button"))?.focus();
}
let confirmFn = null;
function openConfirm({ title, text, ok, danger = true, typed = null, onOk, cancel = "Cancelar" }){
  confirmFn = onOk;
  modal(`<div class="modal-h"><h2 id="md-h">${esc(title)}</h2></div><p style="color:var(--color-gray-700)">${esc(text)}</p>
    ${typed ? `<div class="field" style="margin-top:16px"><label for="cf-typed">Escribe <b>${esc(typed)}</b> para confirmar</label><input class="input" id="cf-typed" autocomplete="off" data-typed="${esc(typed)}"></div>` : ""}
    <div class="form-foot"><button class="btn btn-secondary" data-act="close">${esc(cancel)}</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-act="confirm-ok" ${typed ? "disabled" : ""}>${danger ? ic("trash") : ""}${esc(ok)}</button></div>`, true);
  if (!typed) $("#layer .btn-secondary").focus();
}
function toast(msg, kind = "ok", action = null){
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${ic(kind === "err" ? "alert" : "check")}<span class="msg">${esc(msg)}</span>${action ? `<button class="tact" type="button">${esc(action.label)}</button>` : ""}`;
  if (action) el.querySelector(".tact").addEventListener("click", () => { el.remove(); action.fn(); });
  $("#toasts").appendChild(el); setTimeout(() => el.remove(), action ? (action.ms || 10000) : kind === "err" ? 6000 : 3500);
}
function openMenu(btn, id){
  const r = S.docs.get(id); if (!r) return;
  const items = [`<button data-m="edit">${ic("pencil")}Editar</button>`];
  if (isTaskLike(r)) {
    items.push(isDone(r) ? `<button data-m="reopen">${ic("undo")}Volver a pendiente</button>` : `<button data-m="done">${ic("check")}Completar</button>`);
    if (!isDone(r) && r.estado !== "en_progreso") items.push(`<button data-m="progress">${ic("progress")}Marcar en progreso</button>`);
    if (!isDone(r)) items.push(`<div class="sep"></div><span class="sub">Posponer</span><button data-m="pp1">${ic("snooze")}Para mañana</button><button data-m="pp3">${ic("snooze")}En 3 días</button><button data-m="pp7">${ic("snooze")}Una semana</button>`);
  } else if (isEventLike(r)) {
    items.push(`<div class="sep"></div><span class="sub">Mover</span><button data-m="pp1">${ic("snooze")}Al día siguiente</button><button data-m="pp7">${ic("snooze")}Una semana después</button>`);
  }
  if (r.tipo !== "nota" && metas().length) items.push(`<button data-m="link">${ic("target")}Vincular a una meta</button>`);
  items.push(`<button data-m="wa">${ic("whatsapp")}Compartir por WhatsApp</button>`);
  items.push(`<div class="sep"></div><button data-m="del" class="danger">${ic("trash")}Eliminar</button>`);
  placeMenu(btn, id, items);
}
function placeMenu(btn, id, items){
  const rect = btn.getBoundingClientRect();
  $("#layer").innerHTML = `<div class="menu" role="menu" id="menu" data-id="${esc(id)}">${items.join("")}</div>`;
  const m = $("#menu"), mw = m.offsetWidth, mh = m.offsetHeight;
  let left = Math.min(rect.right - mw, window.innerWidth - mw - 16); left = Math.max(16, left);
  let top = rect.bottom + 4; if (top + mh > window.innerHeight - 16) top = Math.max(16, rect.top - mh - 4);
  m.style.left = left + "px"; m.style.top = top + "px";
  m.querySelectorAll("button").forEach(b => b.setAttribute("role", "menuitem"));
  m.querySelector("button").focus(); m._opener = btn;
}
const lo = t => fem(t) ? "la" : "lo";
async function menuAction(id, act){
  const r = S.docs.get(id); closeLayer(); if (!r) return;
  const now = new Date().toISOString();
  if (r.k === "meta") return metaAction(r, act);
  if (act === "edit") return openEditor(r);
  if (act === "link") return openLink(r);
  if (act === "wa") return abrirEnlace(waLink(waRecordText(r)));
  if (act === "del") return openConfirm({ title:`¿Eliminar ${TIPOS[r.tipo].art}?`, text:`"${r.titulo}" se eliminará y no podrás recuperarl${fem(r.tipo) ? "a" : "o"}.`, ok:"Eliminar",
    onOk: async () => { if (await del(r.id)) toast(say(`Listo, eliminé ${TIPOS[r.tipo].art}.`, "Eliminado."), "ok"); } });
  if (act === "done") return toggleDone(id);
  if (act === "reopen") { await upd(id, { estado:"pendiente", actualizado:now }); return; }
  if (act === "progress") { if (await upd(id, { estado:"en_progreso", actualizado:now })) toast(say("Listo, quedó en progreso.", "En progreso."), "ok"); return; }
  if (act.startsWith("pp")) {
    const n = +act.slice(2), td = today(), prev = r.fecha;
    const base = isEventLike(r) ? (r.fecha || td) : (r.fecha && r.fecha > td ? r.fecha : td);
    const nf2 = addDays(base, n);
    if (await upd(id, { fecha:nf2, actualizado:now })) toast(say(`Listo, ${lo(r.tipo)} pasé para el ${fmtDate(nf2)}.`, `Movido al ${fmtDate(nf2)}.`), "ok", { label:"Deshacer", fn:() => upd(id, { fecha:prev }) });
  }
}
async function toggleDone(id){
  const r = S.docs.get(id); if (!r) return;
  const done = !isDone(r);
  const ok = await upd(id, { estado: done ? "completada" : "pendiente", actualizado:new Date().toISOString() });
  if (ok && done) {
    const td = today(), forToday = recs().filter(x => isTaskLike(x) && x.fecha === td);
    if (forToday.length > 1 && forToday.every(isDone)) toast("¡Cerraste todo lo de hoy! Ahora sí, a descansar.", "ok");
    else toast(say("Listo, uno menos.", "Completado."), "ok", { label:"Deshacer", fn:() => upd(id, { estado:r.estado }) , ms:6000 });
  }
}
let editState = null;
function openEditor(r, isNew = false, extra = {}){ editState = { base:{ ...r }, isNew, errors:{}, ...extra }; drawEditor(); }
function drawEditor(){
  const { base, isNew, errors } = editState;
  const conflict = conflictOf(base, base.id);
  modal(`<div class="modal-h"><h2 id="md-h">${isNew ? `Nuev${fem(base.tipo) ? "a" : "o"} ${TIPOS[base.tipo].n.toLowerCase()}` : `Editar ${TIPOS[base.tipo].n.toLowerCase()}`}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
    ${conflict ? `<div class="banner warn">${ic("alert")}<div>Este evento se cruza con "${esc(conflict.titulo)}" (${fmtTime(conflict.hora)}). ¿Quieres moverlo?</div></div>` : ""}
    <form id="ed-form" novalidate>${formHTML("ed", base, { withEstado:!isNew, errors })}
      <div class="form-foot"><button type="button" class="btn btn-secondary" data-act="close">${isNew ? "Cancelar" : "Descartar cambios"}</button>
      <button type="submit" class="btn btn-primary">${isNew ? `Guardar ${TIPOS[base.tipo].n.toLowerCase()}` : "Guardar cambios"}</button></div></form>`);
  const first = Object.keys(errors)[0];
  (document.getElementById(`ed-${first || "titulo"}`) || $("#ed-titulo"))?.focus();
}
async function saveEditor(){
  const d = readForm("ed", editState.base);
  const errors = validate(d, editState.isNew);
  if (Object.keys(errors).length) { editState.base = d; editState.errors = errors; drawEditor(); return; }
  const id = editState.isNew ? newId() : d.id;
  const prev = editState.isNew ? null : S.docs.get(id);
  const rec = buildRecord({ ...d, origen: editState.origen || d.origen || "manual" }, prev);
  const di = editState.dumpIndex;
  closeLayer();
  if (await put(id, rec)) {
    toast(editState.isNew ? say(`Listo, ${lo(rec.tipo)} guardé${rec.fecha ? " para el " + fmtDate(rec.fecha) : ""}.`, `${cap1(guardad(rec.tipo))}.`) : say("Listo, guardé los cambios.", "Cambios guardados."), "ok");
    if (di != null && S.dump.items[di]) { S.dump.items[di].saved = true; S.dump.items[di].sel = false; render(); }
  }
  editState = null;
}
function openLink(r){
  modal(`<div class="modal-h"><h2 id="md-h">Vincular a una meta</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
    <form id="link-form" data-id="${esc(r.id)}" novalidate><div class="field"><label for="lk-meta">¿A qué meta aporta "${esc(r.titulo)}"?</label><select class="select" id="lk-meta">${optsHTML(metaOpts(), r.meta_id || "")}</select></div>
    <div class="form-foot"><button type="button" class="btn btn-secondary" data-act="close">Cancelar</button><button class="btn btn-primary" type="submit">Vincular</button></div></form>`, true);
}

/* ================= metas ================= */
let metaEdit = null;
function openMeta(m = null, area = null){
  metaEdit = m ? { ...m } : { titulo:"", area:area || userAreas()[0], tipo:"habito", frecuencia_semanal:3, fecha_objetivo:null, estado:"activa" };
  drawMeta();
}
function drawMeta(err = null){
  const m = metaEdit;
  modal(`<div class="modal-h"><h2 id="md-h">${m.id ? "Editar meta" : "Crear meta"}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
    <form id="meta-form" novalidate><div class="form-grid">
      <div class="field full ${err ? "has-error" : ""}"><label for="mt-titulo">¿Qué quieres lograr?</label><input class="input" id="mt-titulo" value="${esc(m.titulo)}" maxlength="60" placeholder="Ej.: Ir al gym, Terminar la tesis">${err ? `<span class="err">${ic("alert","icon-16")}${esc(err)}</span>` : ""}</div>
      <div class="field"><label for="mt-area">Área</label><select class="select" id="mt-area">${optsHTML(areaOpts(m.area), m.area)}</select></div>
      <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">Tipo de meta</legend><div class="seg">
        <input type="radio" name="mt-tipo" id="mt-tipo-h" value="habito" ${m.tipo === "habito" ? "checked" : ""}><label for="mt-tipo-h">Hábito</label>
        <input type="radio" name="mt-tipo" id="mt-tipo-p" value="proyecto" ${m.tipo === "proyecto" ? "checked" : ""}><label for="mt-tipo-p">Proyecto</label></div></fieldset>
      <div class="field" ${m.tipo === "habito" ? "" : "hidden"}><label for="mt-freq">Veces por semana</label><input class="input num" type="number" min="1" max="7" id="mt-freq" value="${m.frecuencia_semanal || 3}"></div>
      <div class="field" ${m.tipo === "proyecto" ? "" : "hidden"}><label for="mt-fecha">Fecha objetivo (opcional)</label><input class="input num" type="date" id="mt-fecha" value="${m.fecha_objetivo || ""}"></div>
    </div><div class="form-foot"><button type="button" class="btn btn-secondary" data-act="close">Cancelar</button><button class="btn btn-primary" type="submit">${m.id ? "Guardar cambios" : "Crear meta"}</button></div></form>`);
}
function readMeta(){
  const m = metaEdit; m.titulo = $("#mt-titulo").value.trim(); m.area = $("#mt-area").value;
  m.tipo = $('input[name="mt-tipo"]:checked').value;
  m.frecuencia_semanal = m.tipo === "habito" ? Math.max(1, Math.min(7, parseInt($("#mt-freq").value) || 1)) : null;
  m.fecha_objetivo = m.tipo === "proyecto" ? ($("#mt-fecha").value || null) : null;
}
async function saveMeta(){
  readMeta(); const m = metaEdit;
  if (!m.titulo) return drawMeta("Agrega un nombre para la meta.");
  const id = m.id || newId("m"), { id:_x, ...data } = m;
  closeLayer();
  if (await put(id, { ...data, k:"meta", creado:m.creado || new Date().toISOString() })) toast(m.id ? say("Listo, actualicé la meta.", "Meta actualizada.") : say("Meta creada. Te voy contando cómo vas.", "Meta creada."), "ok");
  metaEdit = null;
}
function metaMenu(btn, m){
  const items = [`<button data-m="edit">${ic("pencil")}Editar</button>`];
  if (m.estado === "activa") items.push(`<button data-m="pause">${ic("pause")}Pausar</button>`, `<button data-m="win">${ic("trophy")}Marcar como lograda</button>`);
  else items.push(`<button data-m="resume">${ic("play")}Reactivar</button>`);
  items.push(`<div class="sep"></div><button data-m="del" class="danger">${ic("trash")}Eliminar</button>`);
  placeMenu(btn, m.id, items);
}
async function metaAction(m, act){
  if (act === "edit") return openMeta(m);
  if (act === "pause") { if (await upd(m.id, { estado:"pausada" })) toast(say("Listo, la pausé. Sigue aquí para cuando quieras retomarla.", "Meta pausada."), "ok"); }
  if (act === "resume") { if (await upd(m.id, { estado:"activa" })) toast(say("¡De vuelta! La meta está activa otra vez.", "Meta activa."), "ok"); }
  if (act === "win") { if (await upd(m.id, { estado:"lograda" })) toast("¡Lo lograste! Qué orgullo verte llegar.", "ok"); }
  if (act === "del") openConfirm({ title:"¿Eliminar esta meta?", text:`"${m.titulo}" y sus check-ins se eliminarán. Las tareas vinculadas se quedan.`, ok:"Eliminar",
    onOk: async () => { for (const c of checkins().filter(c => c.meta_id === m.id)) await del(c.id); if (await del(m.id)) toast(say("Listo, eliminé la meta.", "Meta eliminada."), "ok"); } });
}
async function doCheckin(metaId){
  const m = S.docs.get(metaId); if (!m) return;
  if (!gate("checkin")) return;
  if (checkedToday(m)) { toast(say("Ya lo tenías anotado para hoy.", "Ya estaba anotado."), "ok"); return; }
  const id = newId("c");
  if (await put(id, { k:"checkin", meta_id:metaId, fecha:today(), creado:new Date().toISOString() })) {
    const n = weekCheckins(m).length, g = m.frecuencia_semanal || 1;
    toast(n >= g ? `Ya vas ${n} de ${g} esta semana. Qué constancia.` : say(`Anotado. Vas ${n} de ${g} esta semana.`, `${n} de ${g}.`), "ok", { label:"Deshacer", fn:() => del(id), ms:8000 });
  }
}

/* ================= captura con autonomía ================= */
const resetCap = (text = "") => { S.cap = { text, phase:"idle", draft:null, orig:null, source:null, question:null, missing:[], errors:{}, raw:"", conf:0 }; };
function mustAsk(out){
  const lvl = nivel(), d = out.draft;
  if (lvl === 1 || out.source !== "ia" || out.missing.length) return true;
  if (out.conf < (lvl === 2 ? 0.85 : 0.7)) return true;
  if (d.tipo === "checkin") return false;
  if (conflictOf(d)) return true;
  const R = recs().filter(r => r.origen !== "ejemplo");
  if (!R.some(r => r.tipo === d.tipo) || !R.some(r => areaKey(r.area) === areaKey(d.area))) return true;
  return false;
}
async function startCapture(text){
  text = text.trim(); if (!text) return;
  const from = S.view;
  S.cap = { text, raw:text, phase:"loading", draft:null, orig:null, source:null, question:null, missing:[], errors:{}, conf:0 };
  if (S.view !== "capturar") go("capturar"); else render();
  const q = puede("captura_ia");
  const items = await interpretAll(text, q.ok);
  if (S.cap.raw !== text) return;
  if (items.some(x => x.source === "ia")) await contarCaptura();
  if (items.length > 1) {
    S.cap = { ...S.cap, phase:"multi", limite:!q.ok };
    S.dump = { text, phase:"done", items:items.map(x => ({ ...x, sel:true, saved:false })) };
    render(); $("#h-multi")?.scrollIntoView({ block:"start", behavior:"smooth" }); return;
  }
  const out = items[0];
  if (!mustAsk(out)) { resetCap(); await autoSave(out); if (from === "inicio") go("inicio"); else render(); return; }
  S.cap = { ...S.cap, limite:!q.ok, phase:"confirm", draft:out.draft, orig:{ ...out.draft }, source:out.source, conf:out.conf, question:out.question || askFor(out.draft, out.missing), missing:out.missing };
  render();
  const first = out.missing[0]; document.getElementById(first ? `cf-${first}` : "cf-titulo")?.focus({ preventScroll:false });
}
async function autoSave(out){
  const d = out.draft;
  if (d.tipo === "checkin") return doCheckin(d.meta_id);
  const id = newId(), rec = buildRecord({ ...d, origen:"auto", confianza_ia:out.conf });
  if (await put(id, rec)) toast(say(`Listo, guardé «${rec.titulo}»${rec.fecha ? " para el " + fmtDate(rec.fecha) : ""}.`, `Guardado${rec.fecha ? " para el " + fmtDate(rec.fecha) : ""}.`), "ok", { label:"Deshacer", fn:async () => { if (await del(id)) toast("Listo, lo deshice.", "ok"); }, ms:10000 });
}
async function confirmCapture(){
  const d = readForm("cf", S.cap.draft);
  const errors = validate(d, true);
  S.cap.draft = d;
  if (Object.keys(errors).length) { S.cap.errors = errors; render(); const k = Object.keys(errors)[0]; document.getElementById(`cf-${k}`)?.focus(); return; }
  const o = S.cap.orig || {}, changed = ["tipo","titulo","fecha","hora","prioridad","area"].filter(k => (o[k] || null) !== (d[k] || null));
  const id = newId(), rec = buildRecord({ ...d, origen:"captura", confianza_ia:S.cap.conf, sin_cambios:changed.length === 0 });
  const btn = $("#conf-form button[type=submit]"); if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>Guardando…`; }
  const raw = S.cap.raw;
  if (await put(id, rec)) {
    for (const k of changed.filter(k => k !== "titulo")) await put(newId("x"), { k:"correccion", campo:k, propuesto:o[k] || null, final:d[k] || null, texto:raw.slice(0, 200), titulo:rec.titulo, creado:new Date().toISOString() });
    toast(say(`Listo, ${lo(rec.tipo)} guardé${rec.fecha ? " para el " + fmtDate(rec.fecha) : ""}.`, `${cap1(guardad(rec.tipo))}${rec.fecha ? " para el " + fmtDate(rec.fecha) : ""}.`), "ok");
    resetCap();
    if (isEventLike(rec) && rec.fecha) { const d2 = fromIso(rec.fecha); S.agenda = { y:d2.getFullYear(), m:d2.getMonth(), sel:rec.fecha }; }
    if (rec.tipo === "nota") S.vida.tab = "notas";
    go(isEventLike(rec) ? "agenda" : rec.tipo === "nota" ? "mi-vida" : "tareas");
  } else render();
}
async function seedDemo(){
  for (const r of demoRecords()) { const { id, ...rest } = r; await put(id, buildRecord({ ...rest, origen:"ejemplo" })); }
  toast("Listo, cargué unos ejemplos para que explores.", "ok");
}

/* ================= suelta tu mente ================= */
async function saveDump(){
  const its = S.dump.items.filter(x => x.sel && !x.saved);
  let n = 0;
  for (const it of its) {
    const d = it.draft;
    if (d.tipo === "checkin") { await doCheckin(d.meta_id); it.saved = true; n++; continue; }
    if (!d.titulo) continue;
    if (d.fecha && d.fecha < today()) d.fecha = null;
    if (await put(newId(), buildRecord({ ...d, origen:"captura", confianza_ia:it.conf, sin_cambios:true }))) { it.saved = true; it.sel = false; n++; }
  }
  if (S.dump.items.every(x => x.saved || !x.sel)) S.cap.text = "";
  render();
  if (n) toast(say(`Listo, guardé ${plural(n, "cosa", "cosas")}. Vamos por partes.`, `${plural(n, "registro guardado", "registros guardados")}.`), "ok");
}

/* ================= diario ================= */
async function saveDiary(){
  const text = ($("#dy-text")?.value || "").trim();
  if (!text) { toast("Escribe algo antes de guardar. Puede ser una sola frase.", "err"); $("#dy-text")?.focus(); return; }
  const mood = S.diary.mood;
  S.diary = { text, mood, phase:"loading", reply:null }; render();
  const ok = await put(newId("d"), { k:"diario", contenido:text, estado_animo:mood || null, creado:new Date().toISOString() });
  if (!ok) { S.diary.phase = "idle"; render(); return; }
  const r = await reflectDiary(text, mood);
  S.diary = { text:"", mood:null, phase:"idle", reply:r }; render();
}

/* ================= cuenta ================= */
function accRead(){ const f = S.acc.form; if (!f) return; ["apodo","ocupacion","trabajo"].forEach(k => { const el = $("#acc-" + k); if (el) f[k] = el.value.trim(); }); }
async function saveAccount(){
  accRead(); const f = S.acc.form;
  const ok = await upd("perfil", { apodo:f.apodo.slice(0, 40), ocupacion_tipo:f.ocupacion_tipo, ocupacion:f.ocupacion, areas:f.areas.slice(), rutina:{ trabajo:f.trabajo, clases:f.clases.slice(), momento:f.momento }, tono:f.tono });
  if (ok) toast(say("Listo, actualicé tu perfil.", "Perfil guardado."), "ok");
}
async function deleteAccount(){
  closeLayer();
  const ids = [...S.docs.keys()];
  for (const id of ids) await del(id);
  if (db && S.uid) { try { await db.doc("cuentas/" + S.uid).delete(); } catch(e){} }
  lastMirror = "";
  toast("Tu cuenta y todos tus datos se eliminaron.", "ok");
  go("portada");
}

/* ================= planes ================= */
async function contarCaptura(){ const p = P_(); if (!perfil()) return; await upd("perfil", { uso:PL.registrarUso(p.uso, today()) }); }
const setPlan = plan => upd("perfil", { plan:PL.normalizar(plan) });
/* cada acción de Plus pasa por aquí: si el plan no la permite, lo explica sin presionar */
function gate(accion){
  if (puede(accion).ok) return true;
  const txt = ARLET_CONFIG.funciones_plus[accion] || "Esto";
  modal(`<div class="modal-h"><h2 id="md-h">Esto es parte de Plus</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
    <p style="color:var(--color-gray-700)">${esc(txt)} es parte de Plus. Todo lo que ya tienes se queda contigo y lo puedes ver cuando quieras.</p>
    <div class="form-foot"><button class="btn btn-secondary" data-act="close">Ahora no</button><a class="btn btn-primary" href="#precios">Ver planes</a></div>`, true);
  return false;
}
let planFlow = null;
function openPlan(id){
  const P = ARLET_CONFIG.planes;
  if (id === "fundadora" && S.cupos != null && S.cupos >= P.fundadora.cupos) { toast("Ya no quedan cupos de fundadora. Plus anual te da casi el mismo ahorro.", "err"); return; }
  planFlow = { id, periodo: id === "plus" ? S.precioPeriodo : id === "fundadora" ? "anual" : "mensual", step:"elige", email:"", code:null, err:null };
  drawPlan();
}
function drawPlan(){
  const f = planFlow, P = ARLET_CONFIG.planes, demo = ARLET_CONFIG.modo_demo;
  let body = "";
  if (f.id === "plus") body = `<div class="opts" role="radiogroup" aria-label="Forma de pago">
      <button type="button" class="opt" role="radio" data-act="plan-per" data-val="mensual" aria-checked="${f.periodo === "mensual"}"><span class="radio"></span><span><b>${soles(P.plus.mensual)} al mes</b><span class="d">Se renueva cada mes. Cancelas cuando quieras.</span></span></button>
      <button type="button" class="opt" role="radio" data-act="plan-per" data-val="anual" aria-checked="${f.periodo === "anual"}"><span class="radio"></span><span><b>${soles(P.plus.anual)} al año</b><span class="d">Ahorras ${soles(PL.ahorroAnual())}. Se renueva cada año.</span></span></button></div>`;
  if (f.id === "fundadora") body = `<p style="color:var(--color-gray-700)">${soles(P.fundadora.primer_anio)} por tu primer año de Plus. Luego se renueva a ${soles(P.fundadora.renueva_anual)} al año, y puedes cancelar cuando quieras.</p>`;
  if (f.id === "estudiante") body = f.step === "elige"
    ? `<p style="color:var(--color-gray-700)">Todo Plus por ${soles(P.estudiante.mensual)} al mes. Para activarlo, verifico tu correo universitario con un código.</p>
       <div class="field ${f.err ? "has-error" : ""}"><label for="st-email">Tu correo universitario</label><input class="input" id="st-email" type="email" value="${esc(f.email)}" placeholder="nombre@universidad.edu.pe" autocomplete="email">${f.err ? `<span class="err">${ic("alert","icon-16")}${esc(f.err)}</span>` : ""}</div>`
    : `<p style="color:var(--color-gray-700)">${demo ? `En la versión real te llegaría un código a <b>${esc(f.email)}</b>. Para esta demostración, tu código es <b class="num">${f.code}</b>.` : `Te envié un código a <b>${esc(f.email)}</b>.`}</p>
       <div class="field ${f.err ? "has-error" : ""}"><label for="st-code">Código de 6 dígitos</label><input class="input num" id="st-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code">${f.err ? `<span class="err">${ic("alert","icon-16")}${esc(f.err)}</span>` : ""}</div>`;
  const btn = f.id === "estudiante" ? (f.step === "elige" ? `<button class="btn btn-primary" data-act="st-send">Enviar código</button>` : `<button class="btn btn-primary" data-act="st-verify">Verificar y activar</button>`)
    : `<button class="btn btn-primary" data-act="plan-go">${demo ? "Activar (demo)" : "Ir a pagar"}</button>`;
  modal(`<div class="modal-h"><h2 id="md-h">${esc(P[f.id].nombre)}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
    <div class="plan-pick">${body}<p class="caption">Precio incluye IGV.${demo ? " Versión de prueba: no se hace ningún cobro." : ""}</p></div>
    <div class="form-foot"><button class="btn btn-secondary" data-act="close">Ahora no</button>${btn}</div>`, true);
}
function stSend(){
  const f = planFlow; f.email = ($("#st-email")?.value || "").trim();
  if (!PL.correoUniversitario(f.email)) { f.err = "Ese correo no parece universitario. Usa el de tu universidad, por ejemplo nombre@universidad.edu.pe."; drawPlan(); return; }
  f.err = null; f.step = "codigo"; f.code = String(Math.floor(100000 + Math.random() * 900000)); drawPlan();
}
function stVerify(){
  const f = planFlow, v = ($("#st-code")?.value || "").trim();
  if (v !== f.code) { f.err = "Ese código no coincide. Revísalo e intenta de nuevo."; drawPlan(); $("#st-code")?.focus(); return; }
  activarPlan();
}
async function activarPlan(){
  const f = planFlow; if (!f) return;
  const plan = PL.activar(P_().plan, f.id, f.periodo, today());
  if (f.id === "estudiante") plan.correo_dominio = f.email.split("@")[1];
  closeLayer(); planFlow = null;
  if (f.id === "fundadora") {
    if (db && S.uid) { try { await db.collection("fundadoras").doc(S.uid).set({ fecha:new Date().toISOString() }); } catch(e){ toast("No pude reservar tu cupo. Intenta de nuevo en unos minutos.", "err"); return; } }
    else S.cupos = (S.cupos || 0) + 1;
  }
  if (await setPlan(plan)) { toast(say("¡Listo! Ya tienes Plus. Gracias por confiar en mí.", "Plus activado."), "ok"); go("inicio"); }
}

/* ================= eventos ================= */
function toggleIn(arr, v){ const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); }
document.addEventListener("click", async e => {
  const t = e.target, menu = $("#menu");
  if (menu && !menu.contains(t)) { closeLayer(); if (t.closest("[data-act=menu],[data-act=meta-menu]")) { e.preventDefault(); return; } }
  const mb = t.closest("[data-m]"); if (mb && menu) { menuAction(menu.dataset.id, mb.dataset.m); return; }
  const ex = t.closest("[data-ex]"); if (ex) { startCapture(ex.dataset.ex); return; }
  const day = t.closest("[data-day]"); if (day) { S.agenda.sel = day.dataset.day; const d = fromIso(S.agenda.sel); S.agenda.y = d.getFullYear(); S.agenda.m = d.getMonth(); render(); return; }
  const fc = t.closest("[data-estado]"); if (fc) { S.tasks.estado = fc.dataset.estado; render(); return; }
  const vt = t.closest("[data-vtab]"); if (vt) { S.vida.tab = vt.dataset.vtab; render(); return; }
  const at = t.closest("[data-atab]"); if (at) { S.admin.tab = at.dataset.atab; render(); return; }
  const md = t.closest("[data-mood]"); if (md) { S.diary.text = $("#dy-text")?.value || S.diary.text; S.diary.mood = S.diary.mood === md.dataset.mood ? null : md.dataset.mood; render(); return; }
  const ch = t.closest("[data-chip]");
  if (ch) {
    const grp = ch.dataset.chip, val = ch.dataset.val;
    if (grp.startsWith("acc-")) { accRead(); const f = S.acc.form, k = grp.slice(4); if (Array.isArray(f[k])) toggleIn(f[k], val); else f[k] = f[k] === val ? null : val; }
    else if (S.ob) { obRead(); const v = S.ob.v; if (Array.isArray(v[grp])) toggleIn(v[grp], val); else v[grp] = v[grp] === val ? null : val; }
    render(); document.querySelector(`[data-chip="${grp}"][data-val="${CSS.escape(val)}"]`)?.focus(); return;
  }
  const op = t.closest("[data-opt]"); if (op && S.ob) { obRead(); S.ob.v[op.dataset.opt] = op.dataset.opt === "autonomia" ? +op.dataset.val : op.dataset.val; render(); document.querySelector(`[data-opt="${op.dataset.opt}"][data-val="${op.dataset.val}"]`)?.focus(); return; }
  const dc = t.closest("[data-dump]"); if (dc) { S.dump.items[+dc.dataset.dump].sel = dc.checked; render(); document.getElementById(dc.id)?.focus(); return; }
  const b = t.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, id = b.closest("[data-id]")?.dataset.id;
  if (act === "scrim" && t !== b) return;
  switch (act) {
    case "toggle": toggleDone(id); break;
    case "menu": openMenu(b, id); break;
    case "meta-menu": { if (!gate("metas")) break; const m = S.docs.get(b.dataset.meta); if (m) metaMenu(b, m); break; }
    case "close": case "scrim": closeLayer(); editState = null; metaEdit = null; break;
    case "confirm-ok": { const fn = confirmFn; confirmFn = null; closeLayer(); if (fn) await fn(); break; }
    case "discard": resetCap(S.cap.raw); render(); $("#cap-text")?.focus(); break;
    case "cap-checkin": { if (!puede("checkin").ok) { gate("checkin"); break; } const mid = S.cap.draft.meta_id; resetCap(); await doCheckin(mid); go("inicio"); break; }
    case "cap-as-task": { const l = localParse(S.cap.raw); l.draft.tipo = "tarea"; l.draft.meta_id = S.cap.draft.meta_id; const f = finishDraft(l.draft); S.cap = { ...S.cap, draft:f.draft, orig:{ ...f.draft }, missing:f.missing, question:askFor(f.draft, f.missing) }; render(); break; }
    case "new": { const tipo = b.dataset.tipo || "tarea"; openEditor({ tipo, titulo:"", descripcion:"", fecha: tipo === "nota" ? null : (S.view === "agenda" ? S.agenda.sel : null), hora:null, prioridad:"media", area:userAreas()[0], estado: isEventLike({ tipo }) ? "confirmada" : "pendiente", meta_id:null }, true); break; }
    case "new-meta": if (gate("metas")) openMeta(null, b.dataset.area || null); break;
    case "checkin": doCheckin(b.dataset.meta); break;
    case "cal-prev": case "cal-next": { let { y, m } = S.agenda; m += act === "cal-next" ? 1 : -1; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.agenda.y = y; S.agenda.m = m; render(); break; }
    case "cal-today": { const d = fromIso(today()); S.agenda = { y:d.getFullYear(), m:d.getMonth(), sel:today() }; render(); break; }
    case "clear-filters": S.tasks = { q:"", estado:"activas", prioridad:"todas", area:"todas", meta:"todas", orden:S.tasks.orden }; render(); break;
    case "clear-gsearch": S.gsearch = ""; $("#gsearch").value = ""; render(); break;
    case "seed": seedDemo(); break;
    case "scroll-how": e.preventDefault(); document.getElementById("como-funciona")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); break;
    case "copy-day": copyText(dayText(), "Resumen copiado. Pégalo donde quieras."); break;
    case "late-today": { const late = daySummary().late, prev = late.map(r => [r.id, r.fecha]); for (const r of late) await upd(r.id, { fecha:today() }); toast(say("Listo, los pasé para hoy. Vamos por partes.", "Movidos a hoy."), "ok", { label:"Deshacer", fn:async () => { for (const [i, f] of prev) await upd(i, { fecha:f }); } }); break; }
    case "level-yes": if (!gate("autonomia")) break; await upd("perfil", { autonomia:2, prop_nivel:today() }); toast(say("Listo. Desde ahora guardo directo lo que tenga claro y te pregunto lo dudoso.", "Nivel 2 activado."), "ok"); break;
    case "level-no": await upd("perfil", { prop_nivel:today() }); toast(say("Perfecto, seguimos así. Tú decides cuándo.", "Seguimos igual."), "ok"); break;
    case "pat-yes": { if (!gate("memoria_aprende")) break; const p = pendingPattern(); if (p) { await put(newId("mem"), { k:"memoria", categoria:"patrones", contenido:p.contenido, regla:{ kw:p.kw, campo:p.campo, valor:p.valor }, fuente:"correccion", confirmado:true, creado:new Date().toISOString() }); toast(say("Listo, lo voy a recordar.", "Guardado."), "ok"); } break; }
    case "pat-no": { const p = pendingPattern(); if (p) await upd("perfil", { patrones_no:[...(P_().patrones_no || []), p.key] }); break; }
    case "plan-week": await upd("perfil", { plan_semana:weekStart() }); go("capturar"); break;
    case "plan-no": await upd("perfil", { plan_semana:weekStart() }); break;
    case "ob-back": S.ob.step = Math.max(0, S.ob.step - 1); S.ob.props = null; render(); break;
    case "ob-skip": obNext(true); break;
    case "ob-later": await upd("perfil", { onboarding_saltado:true }); go("inicio"); break;
    case "ob-finish": { const nuevo = !P_().plan; await upd("perfil", { onboarding_completo:true, onboarding_saltado:false, ...(nuevo ? { plan:PL.normalizar(PL.iniciarPrueba(null, today())) } : {}) }); S.ob = null; go("inicio");
      if (nuevo) toast(say(`Te regalo ${ARLET_CONFIG.prueba.dias} días de Plus, sin tarjeta. Disfrútalos.`, `${ARLET_CONFIG.prueba.dias} días de Plus activados.`), "ok"); break; }
    case "nudge-no": await upd("perfil", { aviso_plus:{ fecha:today(), ctx:"descartado" } }); break;
    case "precio-per": S.precioPeriodo = b.dataset.val; render(); document.querySelector(`[data-act="precio-per"][data-val="${b.dataset.val}"]`)?.focus(); break;
    case "elegir-plan": openPlan(b.dataset.plan); break;
    case "plan-go": activarPlan(); break;
    case "plan-per": planFlow.periodo = b.dataset.val; drawPlan(); break;
    case "plan-cancel": { const pl = P_().plan; openConfirm({ title: pl.estado === "prueba" ? "¿Cancelar tu prueba de Plus?" : "¿Cancelar Plus?", danger:false, cancel: pl.estado === "prueba" ? "Seguir probando" : "Seguir con Plus", ok:"Sí, cancelar",
      text:`Mantienes Plus hasta el ${ultimoDia(pl)} y no se te vuelve a cobrar. Tus datos se quedan contigo: después, lo de Plus pasa a solo lectura.`,
      onOk:async () => { if (await setPlan(PL.cancelar(pl, today()))) toast(say(`Listo, cancelado. Sigues con Plus hasta el ${ultimoDia(pl)}. Aquí estaré si quieres volver.`, "Plus cancelado."), "ok"); } }); break; }
    case "demo-reject": await setPlan(PL.pagoRechazado(P_().plan, today())); toast("Simulé un pago rechazado. Mira el aviso en Inicio.", "ok"); break;
    case "demo-approve": await setPlan(PL.pagoAprobado(P_().plan, today())); toast("Simulé un pago aprobado. Todo en orden.", "ok"); break;
    case "demo-grace": await setPlan({ ...P_().plan, gracia_hasta:today() }); toast("Terminaron los días de gracia: la cuenta pasó a Gratis sin perder datos.", "ok"); break;
    case "demo-end": { const pl = { ...P_().plan, fin_periodo:today() }; await setPlan(PL.renovar(pl, today())); toast(pl.estado === "activa" && !pl.pago_fallido_en ? "Simulé la renovación automática del periodo." : "El periodo terminó: la cuenta pasó a Gratis sin perder datos.", "ok"); break; }
    case "demo-3d": await setPlan({ ...P_().plan, fin_periodo:addDays(today(), ARLET_CONFIG.prueba.aviso_dias_antes) }); await upd("perfil", { aviso_plus:null }); toast("Listo: te quedan 3 días de prueba. Mira Inicio.", "ok"); break;
    case "demo-uso": { const u = P_().uso, n = PL.usadas(u, today()) + 5; await upd("perfil", { uso:{ mes:PL.mesDe(today()), n }, aviso_plus:null }); toast(`Ahora llevas ${n} capturas con IA este mes.`, "ok"); break; }
    case "demo-trial": await setPlan(PL.iniciarPrueba(null, today())); toast(`Empezó tu prueba de ${ARLET_CONFIG.prueba.dias} días.`, "ok"); break;
    case "st-send": stSend(); break;
    case "st-verify": stVerify(); break;
    case "dump-clear": S.dump = { text:"", phase:"idle", items:[] }; resetCap(); render(); $("#cap-text")?.focus(); break;
    case "dump-save": saveDump(); break;
    case "dump-edit": { const i = +b.dataset.i, it = S.dump.items[i]; if (it.draft.tipo === "checkin") { await doCheckin(it.draft.meta_id); it.saved = true; render(); } else openEditor({ ...it.draft, estado: isEventLike(it.draft) ? "confirmada" : "pendiente" }, true, { dumpIndex:i, origen:"captura" }); break; }
    case "dy-task": { if (!gate("diario_propuestas")) break; const tk = S.diary.reply.tareas[+b.dataset.i]; if (await put(newId(), buildRecord({ ...tk, origen:"diario" }))) { tk.done = true; render(); toast(say(`Listo, agregué «${tk.titulo}».`, "Agregado."), "ok"); } break; }
    case "dy-task-no": S.diary.reply.tareas[+b.dataset.i].done = true; render(); break;
    case "dy-mem": { if (!gate("diario_propuestas")) break; const m = S.diary.reply.recuerdos[+b.dataset.i]; if (await put(newId("mem"), { k:"memoria", categoria:m.categoria, contenido:m.contenido, fuente:"diario", confirmado:true, creado:new Date().toISOString() })) { m.done = true; render(); toast(say("Listo, lo voy a recordar.", "Guardado."), "ok"); } break; }
    case "dy-mem-no": S.diary.reply.recuerdos[+b.dataset.i].done = true; render(); break;
    case "dy-del": { const did = b.dataset.idD; openConfirm({ title:"¿Eliminar esta entrada?", text:"Se borrará de tu diario y no podrás recuperarla.", ok:"Eliminar", onOk:async () => { if (await del(did)) toast("Listo, la eliminé.", "ok"); } }); break; }
    case "mem-edit": S.acc.editMem = b.dataset.mem; accRead(); render(); $("#mem-edit")?.focus(); break;
    case "mem-cancel": S.acc.editMem = null; render(); break;
    case "mem-del": { const m = S.docs.get(b.dataset.mem); if (m && await del(m.id)) toast(say("Listo, ya no lo uso.", "Borrado."), "ok"); break; }
    case "mem-del-all": openConfirm({ title:"¿Borrar todo lo que sé de ti?", text:"Dejaré de usar todos tus recuerdos de inmediato. Tus registros, metas y diario se quedan.", ok:"Borrar todo", onOk:async () => { for (const m of memoria()) await del(m.id); toast("Listo, borré todo lo que sabía de ti.", "ok"); } }); break;
    case "set-level": { const v = +b.dataset.val; if (v > 1 && !gate("autonomia")) break; if (await upd("perfil", { autonomia:v })) toast(say(["", "Listo. Te pregunto todo antes de guardar.", "Listo. Guardo lo que tenga claro y te aviso.", "Listo. Confío en lo que tenga claro y te aviso siempre."][v], "Nivel actualizado."), "ok"); break; }
    case "acc-delete": openConfirm({ title:"¿Eliminar tu cuenta?", text:"Se borrarán para siempre tus registros, metas, diario y todo lo que sé de ti. No se puede deshacer.", ok:"Eliminar mi cuenta", typed:"ELIMINAR", onOk:deleteAccount }); break;
    case "adm-susp": { const u = b.dataset.uid; openConfirm({ title:"¿Suspender esta cuenta?", text:`${pName(u)} verá un aviso de cuenta pausada al entrar. Sus datos no se borran.`, ok:"Suspender", onOk:() => adminAction("suspender", u) }); break; }
    case "adm-react": { const u = b.dataset.uid; openConfirm({ title:"¿Reactivar esta cuenta?", text:`${pName(u)} podrá volver a entrar a su espacio.`, ok:"Reactivar", danger:false, onOk:() => adminAction("reactivar", u) }); break; }
    case "adm-role": modal(`<div class="modal-h"><h2 id="md-h">Cambiar rol</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x")}</button></div>
      <p style="color:var(--color-gray-700)">En esta versión de prueba, los roles se manejan desde el botón Compartir de claude.ai:</p>
      <ul style="color:var(--color-gray-700);padding-left:20px;display:flex;flex-direction:column;gap:8px;margin:12px 0"><li><b>Admin:</b> dale acceso de Editor. Verá este panel, pero nunca el contenido privado de nadie.</li><li><b>Usuaria:</b> dale acceso de Colaborador (Contributor), para que pueda guardar sus datos.</li></ul>
      <p class="caption">Así nadie puede darse permisos por su cuenta desde Arlet.</p>
      <div class="form-foot"><button class="btn btn-primary" data-act="close">Entendido</button></div>`, true); break;
  }
});
document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === "quick-form") { const v = $("#quick").value.trim(); if (!v) { $("#quick-err").textContent = "Escribe algo para organizar, por ejemplo una tarea o una reunión."; $("#quick").focus(); return; } startCapture(v); }
  if (f.id === "cap-form") { const v = $("#cap-text").value.trim(); if (!v) { $("#cap-help").textContent = "Escribe algo para organizar, por ejemplo una tarea o una reunión."; $("#cap-help").style.color = "var(--color-error)"; $("#cap-text").focus(); return; } startCapture(v); }
  if (f.id === "conf-form") confirmCapture();
  if (f.id === "ed-form") saveEditor();
  if (f.id === "meta-form") saveMeta();
  if (f.id === "diary-form") saveDiary();
  if (f.id === "ob-form") obNext(false);
  if (f.id === "acc-form") saveAccount();
  if (f.id === "link-form") { const rid = f.dataset.id, v = $("#lk-meta").value || null; closeLayer(); upd(rid, { meta_id:v }).then(ok => ok && toast(v ? say("Listo, lo vinculé a tu meta.", "Vinculado.") : "Listo, lo desvinculé.", "ok")); }
  if (f.id === "mem-form") { const v = $("#mem-edit").value.trim(), mid = f.dataset.mem; if (!v) { toast("Escribe el recuerdo o bórralo.", "err"); return; } S.acc.editMem = null; upd(mid, { contenido:v.slice(0, 160), fuente:"manual", confirmado:true }).then(ok => ok && toast("Listo, lo actualicé.", "ok")); }
  if (f.id === "mem-add") { const v = $("#mem-new").value.trim(); if (!v) { toast("Escribe lo que quieres que recuerde.", "err"); $("#mem-new").focus(); return; } accRead(); put(newId("mem"), { k:"memoria", categoria:$("#mem-cat").value, contenido:v.slice(0, 160), fuente:"manual", confirmado:true, creado:new Date().toISOString() }).then(ok => ok && toast(say("Listo, lo voy a recordar.", "Guardado."), "ok")); }
});
let tq;
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "cap-text") S.cap.text = t.value;
  if (t.id === "quick") { S.cap.text = t.value; $("#quick-err").textContent = ""; }
  if (t.id === "dump-text") S.dump.text = t.value;
  if (t.id === "dy-text") S.diary.text = t.value;
  if (t.id === "cf-typed") { const okb = $("[data-act=confirm-ok]"); if (okb) okb.disabled = t.value.trim().toUpperCase() !== t.dataset.typed; }
  if (t.id === "t-q") { S.tasks.q = t.value; clearTimeout(tq); tq = setTimeout(() => { $("#t-list").innerHTML = tasksListHTML(); }, 120); }
  if (t.id === "n-q") { S.notes.q = t.value; clearTimeout(tq); tq = setTimeout(() => { $("#n-list").innerHTML = notesHTML(); }, 120); }
  if (t.id === "adm-q") { S.admin.q = t.value; clearTimeout(tq); tq = setTimeout(() => { render(); }, 150); }
  if (t.id === "gsearch") { S.gsearch = t.value; clearTimeout(tq); tq = setTimeout(render, 150); }
  if (t.id && t.id.startsWith("cf-") && S.cap.draft && t.id !== "cf-typed") S.cap.draft = readForm("cf", S.cap.draft);
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "t-prio") { S.tasks.prioridad = t.value; render(); }
  if (t.id === "t-area") { S.tasks.area = t.value; render(); }
  if (t.id === "t-meta") { S.tasks.meta = t.value; render(); }
  if (t.id === "t-orden") { S.tasks.orden = t.value; render(); }
  if (t.id === "cf-tipo" || t.id === "cf-fecha" || t.id === "cf-hora") {
    const d = readForm("cf", S.cap.draft); S.cap.draft = d;
    const f = finishDraft(d); S.cap.missing = f.missing; S.cap.question = f.missing.length ? askFor(d, f.missing) : null;
    if (S.cap.errors.fecha && d.fecha) delete S.cap.errors.fecha;
    render();
  }
  if (t.id === "cf-titulo" && S.cap.errors.titulo && t.value.trim()) delete S.cap.errors.titulo;
  if (t.id === "ed-tipo" && editState) { editState.base = readForm("ed", editState.base); drawEditor(); }
  if (t.name === "mt-tipo" && metaEdit) { readMeta(); drawMeta(); $(`#mt-tipo-${metaEdit.tipo === "habito" ? "h" : "p"}`)?.focus(); }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("#layer").innerHTML) { const opener = $("#menu")?._opener; closeLayer(); editState = null; metaEdit = null; opener?.focus(); }
  if ($("#menu") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    e.preventDefault(); const bs = [...$("#menu").querySelectorAll("button")]; const i = bs.indexOf(document.activeElement);
    bs[(i + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length].focus();
  }
});
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => { if ($("#menu")) closeLayer(); });

route();
initStore();
})();
