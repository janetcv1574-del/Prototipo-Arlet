
/* ================= cuenta: tu plan ================= */
const planNombre = ef => ef.id === "gratis" ? ARLET_CONFIG.planes.gratis.nombre : ef.era_fundadora && ef.id === "plus" ? "Arlet Plus (fundadora)" : (ARLET_CONFIG.planes[ef.id] || {}).nombre || "Arlet Plus";
const ultimoDia = pl => fmtDateY(addDays(pl.fin_periodo, -1));
function planBox(){
  const p = P_(), pl = p.plan, ef = planEf(), td = today(), C = ARLET_CONFIG;
  const u = PL.usadas(p.uso, td), l = PL.limite(ef);
  let estado = "", chip = "";
  if (!ef.plus) { chip = `<span class="chip st-pendiente">${ic("circle")}Gratis</span>`;
    estado = ef.anterior ? `Tu ${ef.anterior.estado === "prueba" ? "prueba de Plus" : "Plus"} terminó el ${esc(fmtDateY(PL.ultimoDiaPlus(ef.anterior)))}. Todo lo tuyo sigue aquí; lo de Plus está en solo lectura.` : "Tienes lo esencial para ordenar tu semana."; }
  else if (pl.estado === "prueba") { const n = PL.diasRestantes(pl, td); chip = `<span class="chip st-info">${ic("heart")}Prueba gratis</span>`;
    estado = `Te ${n === 1 ? "queda 1 día" : `quedan ${n} días`} de Plus: hasta el ${esc(ultimoDia(pl))}. No te pedimos tarjeta.`; }
  else if (pl.estado === "cancelada") { chip = `<span class="chip st-pronto">${ic("info")}Cancelado</span>`;
    estado = `Cancelaste el ${esc(fmtDateY(pl.cancelada_en))}. Mantienes Plus hasta el ${esc(ultimoDia(pl))} y no se te vuelve a cobrar.`; }
  else if (ef.en_gracia) { chip = `<span class="chip st-vencida">${ic("alert")}Pago pendiente</span>`;
    estado = `No pude renovar tu Plus. Revisa tu medio de pago: mantienes Plus hasta el ${esc(fmtDate(addDays(ef.gracia_hasta, -1)))}.`; }
  else { chip = `<span class="chip st-completada">${ic("check")}Activo</span>`;
    estado = `Próximo cobro: <b class="num">${soles(PL.proximoCobro(pl))}</b> el ${esc(fmtDateY(pl.fin_periodo))}${pl.periodo === "anual" ? " (anual)" : ""}.${C.modo_demo ? " Es un cobro simulado." : ""}`; }
  const canCancel = ef.plus && (pl.estado === "activa" || pl.estado === "prueba");
  return `<section class="card plan-box" aria-labelledby="h-plan">
    <div class="plan-head"><div><span class="overline">Tu plan</span><h2 id="h-plan">${esc(planNombre(ef))}</h2></div>${chip}</div>
    <p style="color:var(--color-gray-700)">${estado}</p>
    <div class="usage"><div class="row-inline" style="justify-content:space-between"><span class="label">Capturas con IA este mes</span><span class="num caption"><b style="color:var(--color-ink)">${u}</b>${ef.plus ? "" : ` de ${l}`}</span></div>
      ${ef.plus ? `<span class="caption">Sin contar. Tope de uso razonable: ${l} al mes.</span>` : `<div class="gbar" role="progressbar" aria-label="Capturas usadas" aria-valuemin="0" aria-valuemax="${l}" aria-valuenow="${u}"><i style="width:${Math.min(100, u / l * 100)}%"></i></div>`}</div>
    <div class="row-inline"><a class="btn btn-secondary" href="#precios">Cambiar plan</a>${canCancel ? `<button class="btn btn-text" data-act="plan-cancel">Cancelar ${pl.estado === "prueba" ? "la prueba" : "Plus"}</button>` : ""}</div>
    <p class="caption">Precio incluye IGV. Si cancelas, tus datos se quedan contigo.</p>
    ${C.modo_demo ? `<div class="demo-tools"><span class="overline">Herramientas de demostración</span><p class="caption">No hay cobros reales. Usa esto para probar cómo responde Arlet.</p>
      <div class="row-inline">
        ${pl && pl.estado === "activa" && !pl.pago_fallido_en ? `<button class="btn btn-text" data-act="demo-reject">Simular pago rechazado</button>` : ""}
        ${pl && pl.pago_fallido_en ? `<button class="btn btn-text" data-act="demo-approve">Simular pago aprobado</button><button class="btn btn-text" data-act="demo-grace">Terminar los días de gracia</button>` : ""}
        ${pl && ef.plus ? `<button class="btn btn-text" data-act="demo-end">Adelantar al fin del periodo</button>` : ""}
        ${pl && pl.estado === "prueba" ? `<button class="btn btn-text" data-act="demo-3d">Dejar 3 días de prueba</button>` : ""}
        <button class="btn btn-text" data-act="demo-uso">Sumar 5 capturas usadas</button>
        ${!pl ? `<button class="btn btn-text" data-act="demo-trial">Empezar la prueba de Plus</button>` : ""}
      </div></div>` : ""}
  </section>`;
}

/* ================= cuenta ================= */
function viewCuenta(){
  if (!S.loaded || !perfil()) return `<div class="card">${loadingRows()}</div>`;
  const p = P_(), r = p.rutina || {}, mem = memoria(), em = S.acc.editMem;
  if (!S.acc.form) S.acc.form = { apodo:p.apodo || "", nombre:p.nombre || "", ocupacion_tipo:p.ocupacion_tipo || null, ocupacion:p.ocupacion || "", areas:(p.areas || []).slice(), trabajo:r.trabajo || "", clases:(r.clases || []).slice(), momento:r.momento || null, tono:p.tono || "cercano" };
  const f = S.acc.form;
  const groups = Object.keys(MEM_CATS).map(cat => {
    const items = mem.filter(m => m.categoria === cat);
    if (!items.length) return "";
    return `<div class="mem-group"><h3>${MEM_CATS[cat]}</h3>${items.map(m => em === m.id
      ? `<form class="mem" id="mem-form" data-mem="${esc(m.id)}"><label class="sr" for="mem-edit">Editar recuerdo</label><input class="input" id="mem-edit" value="${esc(m.contenido)}" maxlength="160"><button class="btn btn-primary" type="submit" style="height:40px">Guardar</button><button class="btn btn-text" type="button" data-act="mem-cancel">Cancelar</button></form>`
      : `<div class="mem"><div class="tx">${esc(m.contenido)}<span class="caption">${{ entrevista:"De la entrevista", diario:"De tu diario", correccion:"Aprendido de tus correcciones", manual:"Lo agregaste tú" }[m.fuente] || ""}</span></div>
        <button class="icon-btn" data-act="mem-edit" data-mem="${esc(m.id)}" aria-label="Editar: ${esc(m.contenido)}">${ic("pencil")}</button>
        <button class="icon-btn" data-act="mem-del" data-mem="${esc(m.id)}" aria-label="Borrar: ${esc(m.contenido)}">${ic("trash")}</button></div>`).join("")}</div>`;
  }).join("");
  return `
  <div class="page-head"><div><h1>Tu cuenta</h1><p>Tu perfil, lo que sé de ti y cuánto hago por mi cuenta.</p></div></div>
  ${!p.onboarding_completo ? `<div class="banner info">${ic("heart")}<div><b>Te faltan algunas preguntas de la bienvenida.</b> <a href="#bienvenida">Seguir la entrevista</a></div></div>` : ""}
  <div class="acc-grid">
    <div class="stack">
      <section class="card" aria-labelledby="h-mem">
        <div class="card-head"><div><h2 id="h-mem">Lo que Arlet sabe de ti</h2><p class="caption">Esto es lo que recuerdo de ti. Tú decides qué se queda.</p></div></div>
        ${groups || emptyState("heart","Todavía no sé mucho de ti","Cuéntame en la entrevista, en tu diario o agrégalo aquí.")}
        <form class="row-inline" id="mem-add" style="margin-top:var(--space-5)" novalidate>
          <div class="field" style="flex:1;min-width:200px"><label for="mem-new">Agregar algo que quieras que recuerde</label><input class="input" id="mem-new" maxlength="160" placeholder="Ej.: Los domingos almuerzo con mi familia"></div>
          <div class="field" style="min-width:180px"><label for="mem-cat">Categoría</label><select class="select" id="mem-cat">${optsHTML(Object.fromEntries(Object.entries(MEM_CATS).filter(([k]) => k !== "patrones")), "sobre_mi")}</select></div>
          <button class="btn btn-secondary" type="submit" style="align-self:flex-end">${ic("plus")}Agregar</button>
        </form>
        ${mem.length ? `<div style="margin-top:var(--space-5);padding-top:var(--space-4);border-top:1px solid var(--color-gray-300)"><button class="btn btn-text" data-act="mem-del-all" style="color:var(--color-error)">${ic("trash")}Borrar todo lo que sé de ti</button></div>` : ""}
      </section>
      <section class="card" aria-labelledby="h-aut">
        <div class="card-head"><div><h2 id="h-aut">Cuánto hago por mi cuenta</h2><p class="caption">Siempre te pregunto si falta un dato, si algo se cruza o si es la primera vez que veo algo así.</p></div></div>
        <div class="opts" role="radiogroup" aria-label="Nivel de autonomía">${AUTON.map(a => `<button type="button" class="opt" role="radio" data-act="set-level" data-val="${a.v}" aria-checked="${nivel() === a.v}"><span class="radio"></span><span><b>${a.n}</b><span class="d">${a.d}</span>${a.v > 1 && !esPlus() ? `<span class="lock-chip" style="margin-top:8px">${ic("lock")}Parte de Plus</span>` : ""}</span></button>`).join("")}</div>
        ${!esPlus() && (P_().autonomia || 1) > 1 ? `<p class="caption" style="margin-top:12px">Habías elegido el nivel ${P_().autonomia}. Lo guardo para cuando vuelvas a Plus; mientras tanto te pregunto todo.</p>` : ""}
      </section>
    </div>
    <div class="stack">
      ${planBox()}
      <form class="card" id="acc-form" novalidate aria-labelledby="h-prof">
        <div class="card-head"><h2 id="h-prof">Tu perfil</h2></div>
        <div class="stack-sm">
          <div class="field"><label for="acc-apodo">Cómo te gusta que te llamen</label><input class="input" id="acc-apodo" value="${esc(f.apodo)}" maxlength="40"></div>
          <div class="field"><span class="label" id="acc-oc-l">En qué andas</span><div class="chipset" role="group" aria-labelledby="acc-oc-l">${OCUP.map(o => chipBtn("acc-ocupacion_tipo", o, esc(o), f.ocupacion_tipo === o)).join("")}</div></div>
          <div class="field"><label for="acc-ocupacion">Dónde trabajas o qué estudias</label><input class="input" id="acc-ocupacion" value="${esc(f.ocupacion)}" maxlength="80"></div>
          <div class="field"><span class="label" id="acc-ar-l">Tus áreas de vida</span><div class="chipset" role="group" aria-labelledby="acc-ar-l">${OB_AREAS.map(k => chipBtn("acc-areas", k, `<i class="dot"></i>${esc(OB_AREA_LBL(k))}`, f.areas.includes(k), "a-" + k)).join("")}</div></div>
          <div class="field"><label for="acc-trabajo">Horario de trabajo</label><input class="input" id="acc-trabajo" value="${esc(f.trabajo)}" maxlength="80" placeholder="Ej.: lun a vie, de 9:00 a. m. a 6:00 p. m."></div>
          <div class="field"><span class="label" id="acc-cl-l">Días de clase</span><div class="chipset" role="group" aria-labelledby="acc-cl-l">${DIAS.map(d => chipBtn("acc-clases", d, d, f.clases.includes(d))).join("")}</div></div>
          <div class="field"><span class="label" id="acc-mo-l">Mejor momento para planificar</span><div class="chipset" role="group" aria-labelledby="acc-mo-l">${MOMENTOS.map(m => chipBtn("acc-momento", m, m, f.momento === m)).join("")}</div></div>
          <div class="field"><span class="label" id="acc-to-l">Cómo prefieres que te hable</span><div class="chipset" role="group" aria-labelledby="acc-to-l">${TONOS.map(t => chipBtn("acc-tono", t.v, t.n, f.tono === t.v)).join("")}</div></div>
        </div>
        <div class="form-foot"><button class="btn btn-primary" type="submit">Guardar perfil</button></div>
      </form>
      <section class="card" aria-labelledby="h-data">
        <div class="card-head"><h2 id="h-data">Tu sesión y tus datos</h2></div>
        <div class="stack-sm">
          <p class="caption">Entras con tu cuenta de Claude. Para cerrar sesión, sal de tu cuenta en claude.ai.</p>
          <div class="row-inline"><a class="btn btn-secondary" href="#portada">${ic("logout")}Ir a la portada</a>${!recs().length ? `<button class="btn btn-secondary" data-act="seed">Cargar ejemplos</button>` : ""}</div>
        </div>
      </section>
      <section class="card danger-zone" aria-labelledby="h-del">
        <h2 id="h-del">Eliminar mi cuenta</h2>
        <p style="margin-block:var(--space-2) var(--space-4);color:var(--color-gray-700)">Borra para siempre tus registros, metas, diario y todo lo que sé de ti.</p>
        <button class="btn btn-danger" data-act="acc-delete">${ic("trash")}Eliminar mi cuenta</button>
      </section>
    </div>
  </div>`;
}

/* ================= administración ================= */
let adminSubs = null;
function adminSubscribe(){
  if (adminSubs || !db || !S.canEdit) return;
  adminSubs = [];
  const t = setTimeout(() => { S.admin.loaded = true; softRender(); }, 10000);
  adminSubs.push(db.collection("cuentas").onSnapshot(s => { clearTimeout(t); S.admin.cuentas = s.docs.map(x => ({ id:x.id, ...x.data() })); S.admin.loaded = true; resolveProfiles(); softRender(); }, () => { S.admin.loaded = true; softRender(); }));
  adminSubs.push(db.collection("estados").onSnapshot(s => { S.admin.estados = Object.fromEntries(s.docs.map(x => [x.id, x.data()])); softRender(); }, () => {}));
  adminSubs.push(db.collection("admin_log").orderBy("fecha", "desc").limit(200).onSnapshot(s => { S.admin.log = s.docs.map(x => ({ id:x.id, ...x.data() })); resolveProfiles(); softRender(); }, () => {}));
}
async function resolveProfiles(){
  if (!userNs) return;
  const ids = new Set(S.admin.cuentas.map(c => c.id)); S.admin.log.forEach(l => { ids.add(l.admin); ids.add(l.objetivo); });
  const need = [...ids].filter(i => i && !S.admin.profiles[i]);
  if (!need.length) return;
  try { const ps = await userNs.profiles(need); Object.assign(S.admin.profiles, ps); softRender(); } catch(e){}
}
const pName = id => (S.admin.profiles[id] && S.admin.profiles[id].name) || (id === S.uid ? (nombre() || "Tú") : "Persona sin nombre visible");
const pMail = id => (S.admin.profiles[id] && S.admin.profiles[id].email) || "";
const fmtTs = ts => ts ? fmtDate(isoDay(ts)) : "—";
function viewAdmin(){
  if (S.mode === "local") return `<div class="page-head"><div><h1>Administración</h1><p>El panel funciona cuando Arlet está publicada en claude.ai.</p></div></div>`;
  adminSubscribe();
  const A = S.admin, tab = A.tab;
  const tabs = `<div class="tabs" role="tablist" aria-label="Administración">${[["resumen","Resumen","chart"],["usuarias","Usuarias","users"],["bitacora","Bitácora","list"]].map(([k, n, i]) => `<button class="tab" role="tab" data-atab="${k}" aria-selected="${tab === k}">${ic(i,"icon-16")}${n}</button>`).join("")}</div>`;
  const head = `<div class="page-head"><div><h1>Administración</h1><p>Cómo va Arlet. Aquí solo ves datos de cuenta y conteos: el contenido de cada persona es privado, también para ti.</p></div></div>`;
  if (!A.loaded) return head + tabs + `<div class="card">${loadingRows()}</div>`;
  return head + tabs + (tab === "usuarias" ? adminUsers() : tab === "bitacora" ? adminLog() : adminResumen());
}
function adminResumen(){
  const C = S.admin.cuentas, td = today(), ws = addDays(td, -6);
  const nuevas = C.filter(c => isoDay(c.creado) >= ws).length, activas = C.filter(c => isoDay(c.ultimo_acceso) >= ws).length;
  const conf = C.reduce((a, c) => a + (c.confirmadas || 0), 0), sin = C.reduce((a, c) => a + (c.sin_cambios || 0), 0), err = C.reduce((a, c) => a + (c.errores_ia || 0), 0);
  const days = []; for (let i = 13; i >= 0; i--) days.push(addDays(td, -i));
  const per = days.map(d => C.reduce((a, c) => a + ((c.capturas_dia || {})[d] || 0), 0)), max = Math.max(1, ...per);
  const kpi = (v, k) => `<div class="card kpi"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  const byPlan = { gratis:0, prueba:0, plus:0, estudiante:0, fundadora:0 };
  C.forEach(c => { const k = c.plan_estado === "prueba" && c.plan_id !== "gratis" ? "prueba" : c.fundadora && c.plan_id !== "gratis" ? "fundadora" : (byPlan[c.plan_id] != null ? c.plan_id : "gratis"); byPlan[k]++; });
  const mrr = C.reduce((a, c) => a + (c.mensual_eq || 0), 0);
  const trial = C.filter(c => c.tuvo_prueba), conv = trial.filter(c => c.pagado);
  const mes = td.slice(0, 7), canc = C.filter(c => (c.cancelada_en || "").slice(0, 7) === mes).length;
  const F = ARLET_CONFIG.planes.fundadora;
  return `<div class="kpis">
    ${kpi(soles(mrr.toFixed(2)), `Ingresos recurrentes del mes${ARLET_CONFIG.modo_demo ? " (simulados)" : ""}`)}${kpi(trial.length ? Math.round(conv.length / trial.length * 100) + " %" : "—", `Conversión de prueba a pago (${conv.length} de ${trial.length})`)}${kpi(nf(canc), "Cancelaciones este mes")}
    ${kpi(`${nf(S.cupos ?? C.filter(c => c.fundadora).length)} de ${F.cupos}`, "Cupos de fundadora usados")}
    <div class="card kpi" style="grid-column:span 2"><span class="k">Usuarias por plan</span><div class="legend" style="margin-top:4px">${[["gratis","Gratis"],["prueba","En prueba"],["plus","Plus"],["estudiante","Estudiante"],["fundadora","Fundadora"]].map(([k, n]) => `<span><b class="num" style="font-size:20px;color:var(--color-ink)">${byPlan[k]}</b> ${n}</span>`).join("")}</div></div>
  </div>
  <div class="kpis">
    ${kpi(nf(C.length), "Usuarias en total")}${kpi(nf(nuevas), "Nuevas en los últimos 7 días")}${kpi(nf(activas), "Activas en los últimos 7 días")}
    ${kpi(conf ? Math.round(sin / conf * 100) + " %" : "—", "Capturas confirmadas sin cambios")}${kpi(nf(conf), "Capturas confirmadas")}${kpi(nf(err), "Errores de la IA")}
  </div>
  <section class="card" aria-labelledby="h-cpd"><div class="card-head"><div><h2 id="h-cpd">Capturas por día</h2><p class="caption">Últimos 14 días, de todas las cuentas.</p></div></div>
    <div class="bars" role="img" aria-label="${esc(days.map((d, i) => `${fmtDate(d)}: ${per[i]}`).join(", "))}">${days.map((d, i) => `<div class="b"><em>${per[i] || ""}</em><i style="height:${Math.round(per[i] / max * 100)}%"></i><span>${fromIso(d).getDate()}</span></div>`).join("")}</div>
  </section>`;
}
function adminUsers(){
  const q = norm(S.admin.q.trim());
  const C = S.admin.cuentas.filter(c => !q || norm(pName(c.id) + " " + pMail(c.id)).includes(q)).sort((a, b) => (b.ultimo_acceso || "").localeCompare(a.ultimo_acceso || ""));
  const est = id => (S.admin.estados[id] && S.admin.estados[id].estado) || "activa";
  return `<div class="toolbar"><div class="toolbar-row"><div class="search">${ic("search")}<label class="sr" for="adm-q">Buscar por nombre o correo</label><input class="input" id="adm-q" type="search" placeholder="Buscar por nombre o correo" value="${esc(S.admin.q)}" autocomplete="off"></div></div></div>
  <section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Correo</th><th>Registro</th><th>Último acceso</th><th>Rol</th><th>Plan</th><th>Estado</th><th><span class="sr">Acciones</span></th></tr></thead><tbody>
  ${C.length ? C.map(c => { const e = est(c.id), me = c.id === S.uid;
    return `<tr data-uid="${esc(c.id)}"><td><b style="font-weight:600" data-pname="${esc(c.id)}"></b>${me ? ' <span class="caption">(tú)</span>' : ""}</td><td data-pmail="${esc(c.id)}"></td><td class="num">${fmtTs(c.creado)}</td><td class="num">${fmtTs(c.ultimo_acceso)}</td>
      <td>${c.es_duena ? "Admin" : "Usuaria"}</td><td>${c.plan_estado === "prueba" && c.plan_id !== "gratis" ? "En prueba" : c.plan_id === "gratis" || !c.plan_id ? "Gratis" : esc((ARLET_CONFIG.planes[c.plan_id] || {}).nombre || c.plan_id)}${c.plan_estado === "cancelada" ? " · cancelado" : ""}</td>
      <td>${e === "suspendida" ? `<span class="chip st-vencida">${ic("pause")}Pausada</span>` : `<span class="chip st-completada">${ic("check")}Activa</span>`}</td>
      <td><div class="row-inline" style="flex-wrap:nowrap">${me ? "" : e === "suspendida" ? `<button class="btn btn-secondary" data-act="adm-react" data-uid="${esc(c.id)}">${ic("play","icon-16")}Reactivar</button>` : `<button class="btn btn-secondary" data-act="adm-susp" data-uid="${esc(c.id)}">${ic("pause","icon-16")}Suspender</button>`}
        <button class="btn btn-text" data-act="adm-role" data-uid="${esc(c.id)}">Cambiar rol</button></div></td></tr>`; }).join("")
    : `<tr><td colspan="8">${emptyState("users","Sin cuentas", q ? "Nadie coincide con tu búsqueda." : "Cuando alguien entre a Arlet, aparecerá aquí.")}</td></tr>`}
  </tbody></table></div></section>`;
}
function adminLog(){
  const L = S.admin.log, lbl = { suspender:"Suspendió la cuenta de", reactivar:"Reactivó la cuenta de", rol:"Revisó el rol de" };
  return `<section class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Quién</th><th>Acción</th><th>A quién</th></tr></thead><tbody>
  ${L.length ? L.map(l => `<tr><td class="num">${fmtTs(l.fecha)} ${l.fecha ? new Date(l.fecha).toLocaleTimeString("es-PE", { hour:"numeric", minute:"2-digit", timeZone:tz() }) : ""}</td><td data-pname="${esc(l.admin)}"></td><td>${esc(lbl[l.accion] || l.accion)}</td><td data-pname="${esc(l.objetivo)}"></td></tr>`).join("")
    : `<tr><td colspan="4">${emptyState("list","Sin acciones todavía","Cada vez que suspendas o reactives una cuenta, quedará registrado aquí.")}</td></tr>`}
  </tbody></table></div></section>`;
}
function fillNames(){ $$("[data-pname]").forEach(el => el.textContent = pName(el.dataset.pname)); $$("[data-pmail]").forEach(el => el.textContent = pMail(el.dataset.pmail) || "—"); }
async function adminAction(accion, uid){
  if (!db) return;
  try {
    if (accion !== "rol") await db.doc("estados/" + uid).set({ estado: accion === "suspender" ? "suspendida" : "activa", actualizado:new Date().toISOString() });
    await db.collection("admin_log").doc(newId("l")).set({ fecha:new Date().toISOString(), admin:S.uid, accion, objetivo:uid });
    toast(accion === "suspender" ? "Listo, la cuenta quedó pausada." : accion === "reactivar" ? "Listo, la cuenta está activa otra vez." : "Quedó anotado en la bitácora.", "ok");
  } catch(e) { toast("No pude completar la acción. Intenta de nuevo en unos minutos.", "err"); }
}
