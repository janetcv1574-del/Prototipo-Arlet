
/* ================= bienvenida: entrevista inicial ================= */
const OCUP = ["Trabajo","Estudio","Trabajo y estudio","Buscando trabajo","Otro"];
const OB_AREAS = ["trabajo","estudios","salud","viajes","finanzas","hogar","familia","hobbies","personal"];
const OB_AREA_LBL = k => k === "personal" ? "Otra" : AREAS[k];
const DIAS = ["lun","mar","mié","jue","vie","sáb","dom"];
const MOMENTOS = ["Mañana","Mediodía","Noche"];
const AUTON = [
  { v:1, n:"Pregúntame todo por ahora", d:"Te muestro lo que entendí y nada se guarda hasta que lo confirmes.", rec:true },
  { v:2, n:"Guarda lo que tengas claro", d:"Si estoy muy segura, lo guardo y te aviso, con la opción de deshacer. Lo dudoso te lo pregunto." },
  { v:3, n:"Confío en ti", d:"Guardo más cosas por mi cuenta y te aviso. Siempre te pregunto lo que falta o lo que se cruza." }
];
const TONOS = [ { v:"cercano", n:"Cercana y con ánimo", d:"\"Listo, lo guardé para el viernes. Vamos por partes.\"" }, { v:"directo", n:"Directa y breve", d:"\"Guardado para el vie 28 nov.\"" } ];
const OB_STEPS = ["nombre","ocupacion","areas","metas","semana","recarga","tono","autonomia","extra"];

function obInit(){
  const p = P_(), r = p.rutina || {};
  const step = Math.min(p.onboarding_paso || 0, OB_STEPS.length);
  S.ob = { step, busy:false, props:null, v:{
    apodo: p.apodo || p.nombre || S.userName || "", ocupacion_tipo:p.ocupacion_tipo || null, ocupacion:p.ocupacion || "",
    areas: (p.areas || []).slice(), metas:"", trabajo:r.trabajo || "", clases:(r.clases || []).slice(), momento:r.momento || null,
    recarga:"", tono:p.tono || "cercano", autonomia:p.autonomia || 1, extra:"" } };
}
const chipBtn = (grp, val, label, on, extra = "") => `<button type="button" class="chipsel ${extra}" data-chip="${grp}" data-val="${esc(val)}" aria-pressed="${on}">${label}</button>`;
function obQuestion(id){
  const v = S.ob.v, n = v.apodo ? esc(v.apodo) : "";
  switch (id) {
    case "nombre": return { h:"¡Hola! Soy Arlet. Antes de empezar, ¿cómo te gusta que te llamen?", p:"Así te voy a saludar cada día.",
      body:`<div class="field"><label for="ob-apodo">Tu nombre o apodo</label><input class="input" id="ob-apodo" value="${esc(v.apodo)}" maxlength="40" autocomplete="nickname"></div>` };
    case "ocupacion": return { h:`${n ? n + ", ¿" : "¿"}en qué andas hoy?`, p:"Me ayuda a entender cómo se reparte tu semana.",
      body:`<div class="chipset" role="group" aria-label="En qué andas">${OCUP.map(o => chipBtn("ocupacion_tipo", o, esc(o), v.ocupacion_tipo === o)).join("")}</div>
      <div class="field"><label for="ob-ocupacion">¿Dónde trabajas o qué estudias? (opcional)</label><input class="input" id="ob-ocupacion" value="${esc(v.ocupacion)}" maxlength="80" placeholder="Ej.: Analista en una consultora, Administración en la U"></div>` };
    case "areas": return { h:"¿Qué partes de tu vida quieres que te ayude a ordenar?", p:"Elige todas las que quieras. Puedes cambiarlas después.",
      body:`<div class="chipset" role="group" aria-label="Áreas de vida">${OB_AREAS.map(k => chipBtn("areas", k, `<i class="dot"></i>${esc(OB_AREA_LBL(k))}`, v.areas.includes(k), "a-" + k)).join("")}</div>` };
    case "metas": return { h:"¿Qué metas tienes ahora mismo?", p:"Escríbelas como te salgan. Yo las ordeno y tú confirmas.",
      body: S.ob.props ? propsHTML("Estas son las metas que entendí. Desmarca las que no quieras guardar.", S.ob.props.map((g, i) => [i, g.titulo, `${areaName(g.area)} · ${g.tipo === "habito" ? `Hábito, ${g.frecuencia_semanal} por semana` : "Proyecto" + (g.fecha_objetivo ? `, para el ${fmtDate(g.fecha_objetivo)}` : "")}`]))
        : `<div class="field"><label for="ob-metas">Tus metas</label><textarea class="textarea" id="ob-metas" placeholder="Terminar la tesis en junio, ir al gym 3 veces por semana, viajar a Europa en 2027">${esc(v.metas)}</textarea></div>` };
    case "semana": return { h:"Cuéntame de tu semana típica.", p:"Con esto sé cuándo proponerte cosas.",
      body:`<div class="field"><label for="ob-trabajo">Horario de trabajo (opcional)</label><input class="input" id="ob-trabajo" value="${esc(v.trabajo)}" maxlength="80" placeholder="Ej.: lun a vie, de 9:00 a. m. a 6:00 p. m."></div>
      <div class="field"><span class="label" id="ob-clases-l">Días de clase (opcional)</span><div class="chipset" role="group" aria-labelledby="ob-clases-l">${DIAS.map(d => chipBtn("clases", d, d, v.clases.includes(d))).join("")}</div></div>
      <div class="field"><span class="label" id="ob-mom-l">¿Cuál es tu mejor momento para planificar?</span><div class="chipset" role="group" aria-labelledby="ob-mom-l">${MOMENTOS.map(m => chipBtn("momento", m, m, v.momento === m)).join("")}</div></div>` };
    case "recarga": return { h:"¿Qué te recarga o te hace feliz?", p:"Lo uso para recordarte lo que te espera cuando cierres el día.",
      body: S.ob.props ? propsHTML("Esto es lo que voy a recordar. Desmarca lo que no quieras.", S.ob.props.map((f, i) => [i, f.contenido, MEM_CATS[f.categoria]]))
        : `<div class="field"><label for="ob-recarga">Lo que te recarga</label><textarea class="textarea" id="ob-recarga" placeholder="Mis gatos Luna y Michi, salir a correr, ver a mi familia el domingo">${esc(v.recarga)}</textarea></div>` };
    case "tono": return { h:"¿Cómo prefieres que te hable?", p:"Puedes cambiarlo cuando quieras.",
      body:`<div class="opts" role="radiogroup" aria-label="Tono">${TONOS.map(t => `<button type="button" class="opt" role="radio" data-opt="tono" data-val="${t.v}" aria-checked="${v.tono === t.v}"><span class="radio"></span><span><b>${t.n}</b><span class="d">${esc(t.d)}</span></span></button>`).join("")}</div>` };
    case "autonomia": return { h:"¿Cuánto quieres que haga por mi cuenta?", p:"Al principio te recomiendo que me dejes preguntarte todo. Cuando te vaya conociendo, te propondré dar el siguiente paso, y tú decides.",
      body:`<div class="opts" role="radiogroup" aria-label="Autonomía">${AUTON.map(a => `<button type="button" class="opt" role="radio" data-opt="autonomia" data-val="${a.v}" aria-checked="${v.autonomia === a.v}"><span class="radio"></span><span><b>${a.n}</b><span class="d">${a.d}</span>${a.rec ? `<span class="rec">Recomendado para empezar</span>` : ""}</span></button>`).join("")}</div>` };
    case "extra": return { h:"¿Algo más que quieras que sepa de ti?", p:"Es opcional. Lo que me cuentes lo puedes ver y borrar en tu cuenta.",
      body: S.ob.props ? propsHTML("Esto es lo que voy a recordar. Desmarca lo que no quieras.", S.ob.props.map((f, i) => [i, f.contenido, MEM_CATS[f.categoria]]))
        : `<div class="field"><label for="ob-extra">Algo más sobre ti (opcional)</label><textarea class="textarea" id="ob-extra" placeholder="Ej.: Los lunes son mis días más pesados. Prefiero hacer lo difícil temprano.">${esc(v.extra)}</textarea></div>` };
  }
}
function propsHTML(intro, items){
  return `<p class="caption">${intro}</p><div class="prop-list">${items.map(([i, t, sub]) => `<label class="prop"><input type="checkbox" data-prop="${i}" checked><span><b>${esc(t)}</b><span class="caption">${esc(sub || "")}</span></span></label>`).join("")}</div>`;
}
function viewBienvenida(){
  if (!S.loaded || !perfil()) return `<div class="ob"><div class="ob-body">${loadingRows()}</div></div>`;
  if (!S.ob) obInit();
  const o = S.ob, total = OB_STEPS.length;
  if (o.step >= total) {
    return `<div class="ob"><div class="ob-top"><a class="brand" href="#portada">${brand()}</a></div>
      <div class="ob-body ob-end">${logo("lg")}<h1>Listo, ${esc(nombre() || "")}. Ya sé un poco de ti.</h1>
      <p style="font-size:17px;line-height:26px;color:var(--color-gray-700);max-width:52ch">Mientras más me cuentes, mejor te voy a acompañar. Todo lo que sé de ti está en tu cuenta, y ahí puedes cambiarlo o borrarlo.</p>
      <div class="ob-foot"><button class="btn btn-primary" data-act="ob-finish">Ir a mi espacio${ic("arrow")}</button></div></div></div>`;
  }
  const id = OB_STEPS[o.step], q = obQuestion(id);
  const pct = Math.round(o.step / total * 100);
  return `<div class="ob">
    <div class="ob-top"><a class="brand" href="#portada">${brand()}</a><button class="btn btn-text" data-act="ob-later">Lo hago después</button></div>
    <div class="ob-prog"><span class="caption num">Pregunta ${o.step + 1} de ${total}</span><div class="track" role="progressbar" aria-label="Avance de la entrevista" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${Math.max(4, pct)}%"></i></div></div>
    <form class="ob-body" id="ob-form" novalidate aria-labelledby="ob-h">
      <div class="ob-q">${logo()}<div><h1 id="ob-h">${q.h}</h1><p>${q.p}</p></div></div>
      <div class="stack-sm">${q.body}</div>
      <div class="ob-foot">
        ${o.step > 0 ? `<button type="button" class="btn btn-secondary" data-act="ob-back">${ic("left")}Atrás</button>` : ""}
        <button type="button" class="btn btn-text" data-act="ob-skip">Prefiero no responder</button>
        <span class="spacer"></span>
        <button type="submit" class="btn btn-primary" ${o.busy ? "disabled" : ""}>${o.busy ? `<span class="spinner"></span>Pensando…` : o.props ? "Guardar y seguir" : "Continuar"}</button>
      </div>
    </form></div>`;
}
function obRead(){
  const v = S.ob.v, g = id => { const el = document.getElementById(id); return el ? el.value.trim() : null; };
  ["apodo","ocupacion","metas","trabajo","recarga","extra"].forEach(k => { const x = g("ob-" + k); if (x !== null) v[k] = x; });
}
async function memFromOb(key, categoria, contenido){
  const id = "mem-ob-" + key;
  if (!contenido) { if (S.docs.get(id)) await del(id); return; }
  await put(id, { k:"memoria", categoria, contenido:contenido.slice(0, 160), fuente:"entrevista", confirmado:true, creado:new Date().toISOString() });
}
async function obNext(skip = false){
  const o = S.ob, id = OB_STEPS[o.step], v = o.v;
  if (!skip) obRead();
  if (!skip && (id === "metas" || id === "recarga" || id === "extra") && !o.props) {
    const txt = v[id];
    if (txt) {
      o.busy = true; render();
      o.props = id === "metas" ? await proposeGoals(txt) : await proposeFacts(txt, id === "recarga" ? "Qué te recarga o te hace feliz" : "Algo más que quieras que sepa de ti");
      o.busy = false;
      if (o.props.length) { render(); return; }
      o.props = null;
    }
  }
  const now = new Date().toISOString(), data = { onboarding_paso:o.step + 1 };
  if (!skip) {
    if (id === "nombre") { data.apodo = v.apodo.slice(0, 40); }
    if (id === "ocupacion") { data.ocupacion_tipo = v.ocupacion_tipo; data.ocupacion = v.ocupacion; await memFromOb("ocupacion", "sobre_mi", [v.ocupacion_tipo, v.ocupacion].filter(Boolean).join(": ")); }
    if (id === "areas") { data.areas = v.areas.slice(); }
    if (id === "semana") {
      data.rutina = { trabajo:v.trabajo, clases:v.clases.slice(), momento:v.momento };
      await memFromOb("trabajo", "rutina", v.trabajo ? `Trabaja ${v.trabajo}` : "");
      await memFromOb("clases", "rutina", v.clases.length ? `Tiene clases los ${v.clases.join(", ")}` : "");
      await memFromOb("momento", "preferencias", v.momento ? `Prefiere planificar en la ${v.momento.toLowerCase() === "mediodía" ? "hora del almuerzo" : v.momento.toLowerCase()}` : "");
    }
    if (id === "tono") data.tono = v.tono;
    if (id === "autonomia") data.autonomia = v.autonomia;
    if (o.props) {
      const keep = $$("[data-prop]").filter(x => x.checked).map(x => o.props[+x.dataset.prop]);
      for (const it of keep) {
        if (id === "metas") await put(newId("m"), { k:"meta", titulo:it.titulo, area:it.area, tipo:it.tipo, frecuencia_semanal:it.frecuencia_semanal, fecha_objetivo:it.fecha_objetivo, estado:"activa", creado:now });
        else await put(newId("mem"), { k:"memoria", categoria:it.categoria, contenido:it.contenido, corto:it.corto || null, fuente:"entrevista", confirmado:true, creado:now });
      }
    }
  }
  await upd("perfil", data);
  o.step++; o.props = null; render(); window.scrollTo(0, 0);
  $("#ob-form input, #ob-form textarea, #ob-form button.chipsel, #ob-form .opt")?.focus({ preventScroll:true });
}
