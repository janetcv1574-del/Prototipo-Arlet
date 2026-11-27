(() => {
"use strict";
/* ================= íconos (Lucide, trazo 1.5) ================= */
const P = {
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  capture:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  tasks:'<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  note:'<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>',
  arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  circle:'<circle cx="12" cy="12" r="9"/>',
  progress:'<path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l3 2"/>',
  cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  cloudoff:'<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  sync:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  device:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  snooze:'<path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/>',
  undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  layers:'<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  list:'<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  chart:'<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  life:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>',
  pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  play:'<polygon points="6 3 20 12 6 21 6 3"/>',
  trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'
};
const ic = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.circle}</svg>`;
const logo = (cls = "") => `<svg class="logo ${cls}" viewBox="0 0 32 32" aria-hidden="true"><rect class="bg" width="32" height="32" rx="9"/><path class="a" d="M9.5 24 16 8.5 22.5 24"/><path class="bar" d="M12.6 18.6h6.8"/></svg>`;
const brand = (cls = "") => `${logo(cls)}Arlet`;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ================= fechas (zona horaria de la usuaria, por defecto America/Lima) ================= */
const DOW = ["dom","lun","mar","mié","jue","vie","sáb"];
const DOWL = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const MON = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MONL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const tz = () => (perfil() && perfil().zona_horaria) || "America/Lima";
function nowParts(){
  try {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone:tz(), year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", hour12:false });
    const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
    return { date:`${p.year}-${p.month}-${p.day}`, hour:(+p.hour) % 24 };
  } catch(e) { const d = new Date(); return { date:iso(d), hour:d.getHours() }; }
}
const today = () => nowParts().date;
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate()+n); return iso(d); };
const diffDays = (a, b) => Math.round((fromIso(a) - fromIso(b)) / 864e5);
const fmtDate = s => { if (!s) return ""; const d = fromIso(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
const fmtTime = t => { if (!t) return ""; let [h,m] = t.split(":").map(Number); const pm = h >= 12; h = h % 12 || 12; return `${h}:${pad(m)} ${pm ? "p. m." : "a. m."}`; };
const relDay = s => { const n = diffDays(s, today()); if (n === 0) return "hoy"; if (n === 1) return "mañana"; if (n === -1) return "ayer"; return fmtDate(s); };
const weekStart = (s = today()) => addDays(s, -((fromIso(s).getDay() + 6) % 7));
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDateY = s => s && s.slice(0, 4) !== today().slice(0, 4) ? `${fmtDate(s)} ${s.slice(0, 4)}` : fmtDate(s);
const longDate = s => { const d = fromIso(s); return `${cap1(DOWL[d.getDay()])} ${d.getDate()} de ${MONL[d.getMonth()]}`; };
const isoDay = ts => { if (!ts) return ""; try { return new Intl.DateTimeFormat("en-CA", { timeZone:tz(), year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date(ts)); } catch(e) { return String(ts).slice(0,10); } };
const nf = n => new Intl.NumberFormat("es-PE").format(n);

/* ================= vocabulario ================= */
const TIPOS = { tarea:{n:"Tarea",art:"la tarea",ic:"tasks",f:true}, reunion:{n:"Reunión",art:"la reunión",ic:"users",f:true}, evento:{n:"Evento",art:"el evento",ic:"calendar",f:false}, recordatorio:{n:"Recordatorio",art:"el recordatorio",ic:"bell",f:false}, nota:{n:"Nota",art:"la nota",ic:"note",f:true} };
const AREAS = {
  trabajo:"Trabajo", estudios:"Estudios", salud:"Salud y ejercicio", viajes:"Viajes", finanzas:"Finanzas",
  hogar:"Hogar y mascotas", familia:"Familia y amistades", hobbies:"Hobbies", personal:"Personal"
};
const AREA_ORDER = Object.keys(AREAS);
const PRIOS = { alta:"Alta", media:"Media", baja:"Baja" };
const ESTADOS = { pendiente:"Pendiente", en_progreso:"En progreso", completada:"Completada", confirmada:"Confirmada" };
const MEM_CATS = { sobre_mi:"Sobre ti", rutina:"Tu rutina", gustos:"Lo que te gusta y te recarga", personas_y_mascotas:"Personas y mascotas", preferencias:"Preferencias", patrones:"Patrones que aprendí" };
const MOODS = ["Con energía","Tranqui","Cansada","Agobiada"];
const isTaskLike = r => r.tipo === "tarea" || r.tipo === "recordatorio";
const isEventLike = r => r.tipo === "reunion" || r.tipo === "evento";
const isDone = r => r.estado === "completada";
const isLate = r => isTaskLike(r) && !isDone(r) && r.fecha && r.fecha < today();
const isSoon = r => isTaskLike(r) && !isDone(r) && r.fecha && !isLate(r) && diffDays(r.fecha, today()) <= 1;
const PRANK = { alta:0, media:1, baja:2 };
const fem = t => TIPOS[t] ? TIPOS[t].f : true;
const guardad = t => fem(t) ? "guardada" : "guardado";

/* ================= estado ================= */
const S = {
  auth:"checking", mode:"init", uid:null, userName:"", isOwner:false, canEdit:false, canWrite:null,
  docs:new Map(), loaded:false, sync:"loading", stale:false, denied:false, cuentaEstado:"activa", estadoLoaded:false,
  view:"portada", gsearch:"",
  cap:{ text:"", phase:"idle", draft:null, orig:null, source:null, question:null, missing:[], errors:{}, raw:"", conf:0 },
  capTab:"una", dump:{ text:"", phase:"idle", items:[] },
  tasks:{ q:"", estado:"activas", prioridad:"todas", area:"todas", meta:"todas", orden:"fecha" },
  notes:{ q:"" }, vida:{ tab:"areas" }, agenda:{ y:null, m:null, sel:null },
  diary:{ text:"", mood:null, phase:"idle", reply:null },
  ob:null, admin:{ tab:"resumen", cuentas:[], estados:{}, log:[], profiles:{}, q:"", loaded:false },
  acc:{ editMem:null }, cupos:null, precioPeriodo:"mensual"
};
const docsOf = k => { const a = []; for (const d of S.docs.values()) if (d.k === k) a.push(d); return a; };
const perfil = () => S.docs.get("perfil") || null;
const recs = () => docsOf("registro");
const metas = () => docsOf("meta");
const checkins = () => docsOf("checkin");
const diario = () => docsOf("diario");
const memoria = () => docsOf("memoria");
const correcciones = () => docsOf("correccion");
const P_ = () => perfil() || {};
const nombre = () => P_().apodo || P_().nombre || S.userName || "";
const directo = () => P_().tono === "directo";
const say = (cercano, dir) => directo() && dir ? dir : cercano;
const planEf = () => PL.efectivo(P_().plan || null, today());
const esPlus = () => planEf().plus;
const puede = acc => PL.puede(planEf(), acc, P_().uso, today());
const nivel = () => PL.nivelEfectivo(planEf(), P_().autonomia || 1);
const soles = n => `${ARLET_CONFIG.moneda} ${Number(n).toFixed(2).replace(/\.00$/, "")}`;
function userAreas(){
  const a = (P_().areas || []).filter(k => AREAS[k]);
  if (!a.length) return ["trabajo","estudios","personal"];
  if (!a.includes("personal")) a.push("personal");
  return AREA_ORDER.filter(k => a.includes(k));
}
const areaName = k => AREAS[k] || "Personal";
const areaKey = k => AREAS[k] ? k : "personal";

/* ================= persistencia ================= */
let db = null, col = null, userNs = null, sampleFn = undefined, loadTimer = null;
const LS_KEY = "arlet-v2-docs";
function loadLocal(){ try { const raw = localStorage.getItem(LS_KEY); if (raw) return JSON.parse(raw); } catch(e){} return []; }
function saveLocal(){ try { localStorage.setItem(LS_KEY, JSON.stringify([...S.docs.values()])); } catch(e){} }
function useLocal(){
  S.mode = "local"; S.sync = "local"; S.auth = "ok"; S.isOwner = !window.ARLET_WEB; S.canEdit = !window.ARLET_WEB; S.estadoLoaded = true;
  S.docs = new Map(loadLocal().map(r => [r.id, r])); S.loaded = true;
  ensurePerfil(); render();
}
async function initStore(){
  const C = window.claude;
  if (!C || typeof C.use !== "function") { useLocal(); return; }
  const [u, d] = await Promise.all([C.use("user"), C.use("db")]);
  userNs = u;
  let uid = null;
  if (u) {
    try { uid = await u.id(); } catch(e){}
    try { const me = await u.me(); if (me && me.name) S.userName = me.name.split(" ")[0]; } catch(e){}
    try { S.isOwner = !!(await u.isOwner()); } catch(e){}
    try { S.canEdit = !!(await u.canEdit()); } catch(e){}
    try { S.canWrite = await u.can("data.write"); } catch(e){ S.canWrite = null; }
  }
  if (!d || !uid) { S.auth = "none"; S.loaded = true; render(); return; }
  S.auth = "ok"; S.uid = uid; db = d; S.mode = "db"; S.sync = "loading";
  render();
  col = db.collection("data/users/" + uid);
  loadTimer = setTimeout(() => { S.stale = true; S.sync = "offline"; render(); }, 10000);
  let first = true;
  col.onSnapshot(snap => {
    S.docs = new Map(snap.docs.map(x => [x.id, { id:x.id, ...x.data() }]));
    S.loaded = true;
    if (!snap.metadata.fromCache) { clearTimeout(loadTimer); S.stale = false; if (first) { first = false; ensurePerfil(); } }
    S.sync = snap.metadata.hasPendingWrites ? "saving" : (S.stale ? "offline" : "saved");
    softRender();
  }, err => {
    clearTimeout(loadTimer); S.loaded = true;
    if (err && (err.code === "permission_denied" || err.code === "not_granted" || err.code === "revoked")) S.denied = true;
    S.sync = "error"; render();
  });
  try { db.collection("fundadoras").onSnapshot(s => { S.cupos = s.size; softRender(); }, () => {}); } catch(e){}
  try {
    db.doc("estados/" + uid).onSnapshot(s => {
      S.estadoLoaded = true;
      const e = s.exists ? (s.data().estado || "activa") : "activa";
      if (e !== S.cuentaEstado) { S.cuentaEstado = e; render(); } else softRender();
    }, () => { S.estadoLoaded = true; });
  } catch(e) { S.estadoLoaded = true; }
}
function newId(p = "r"){ return p + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
async function persist(op, id, data){
  if (S.mode === "local") {
    if (op === "delete") S.docs.delete(id);
    else if (op === "set") S.docs.set(id, { id, ...data });
    else S.docs.set(id, deepMerge({ ...(S.docs.get(id) || { id }) }, data));
    saveLocal(); afterWrite(); render(); return true;
  }
  if (!col) { toast("Tus datos aún no cargan. Espera unos segundos e intenta de nuevo.", "err"); return false; }
  S.sync = "saving"; renderSync();
  try {
    const ref = col.doc(id);
    if (op === "delete") await ref.delete(); else if (op === "set") await ref.set(data); else await ref.update(data);
    if (S.sync === "saving") { S.sync = S.stale ? "offline" : "saved"; renderSync(); }
    afterWrite();
    return true;
  } catch(e) {
    S.sync = "error"; renderSync();
    if (e && e.code === "quota_exceeded") toast("Llegaste al límite de espacio. Elimina registros antiguos para seguir guardando.", "err");
    else if (e && e.code === "invalid_argument" && S.canWrite !== true) toast("Tu acceso es solo de lectura. Pide a quien te compartió Arlet que te dé acceso de colaboradora.", "err");
    else toast(say("No pude guardar eso. Revisa tu conexión y lo intentamos de nuevo.", "No se guardó. Intenta de nuevo."), "err");
    return false;
  }
}
function deepMerge(a, b){ for (const [k, v] of Object.entries(b)) { if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object" && !Array.isArray(a[k])) a[k] = deepMerge({ ...a[k] }, v); else a[k] = v; } return a; }
const upd = (id, data) => persist("update", id, data);
const put = (id, data) => persist("set", id, data);
const del = id => persist("delete", id);

let perfilCreating = false;
async function ensurePerfil(){
  const now = new Date().toISOString(), td = today();
  const p = perfil();
  if (!p) {
    if (perfilCreating) return; perfilCreating = true;
    await put("perfil", { k:"perfil", nombre:S.userName || "", apodo:"", rol: S.isOwner ? "admin" : "usuaria", zona_horaria:"America/Lima",
      ocupacion_tipo:null, ocupacion:"", areas:[], rutina:{}, tono:"cercano", autonomia:1, onboarding_completo:false, onboarding_saltado:false, onboarding_paso:0,
      creado:now, ultimo_acceso:now, errores_ia:0, prop_nivel:null, patrones_no:[], toque:null });
    perfilCreating = false;
    mirrorCuenta(true);
    return;
  }
  const ch = {};
  if (isoDay(p.ultimo_acceso) !== td) ch.ultimo_acceso = now;
  if (p.onboarding_completo && !p.plan) ch.plan = PL.normalizar(PL.iniciarPrueba(null, td));
  else if (p.plan) { const r = PL.renovar(p.plan, td); if (r !== p.plan) ch.plan = PL.normalizar(r); }
  if (Object.keys(ch).length) { await upd("perfil", ch); mirrorCuenta(true); }
}

/* resumen de cuenta para el panel de admin: solo conteos, nunca contenido */
let mirrorTimer = null, lastMirror = "";
function cuentaResumen(){
  const p = P_(), R = recs();
  const cap = R.filter(r => r.origen === "captura" || r.origen === "auto");
  const conf = R.filter(r => r.origen === "captura");
  const dias = {}; const lim = addDays(today(), -13);
  cap.forEach(r => { const d = isoDay(r.creado); if (d >= lim) dias[d] = (dias[d] || 0) + 1; });
  return { creado:p.creado || null, ultimo_acceso:p.ultimo_acceso || null, capturas:cap.length, confirmadas:conf.length,
    sin_cambios:conf.filter(r => r.sin_cambios).length, errores_ia:p.errores_ia || 0, capturas_dia:dias, onboarding:!!p.onboarding_completo, es_duena:S.isOwner,
    plan_id:planEf().id, plan_estado:(p.plan && p.plan.estado) || "gratis", periodo:(p.plan && p.plan.periodo) || null, mensual_eq:Math.round(PL.mensualEquivalente(p.plan) * 100) / 100,
    tuvo_prueba:!!(p.plan && p.plan.tuvo_prueba), pagado:!!(p.plan && p.plan.estado !== "prueba" && p.plan.inicio && p.plan.estado !== "vencida" && (p.plan.estado === "activa" || p.plan.estado === "cancelada") && p.plan.periodo), cancelada_en:(p.plan && p.plan.cancelada_en) || null, fundadora:!!(p.plan && (p.plan.id === "fundadora" || p.plan.era_fundadora)) };
}
function mirrorCuenta(now = false){
  if (S.mode !== "db" || !db || !S.uid || !perfil()) return;
  clearTimeout(mirrorTimer);
  mirrorTimer = setTimeout(async () => {
    const r = cuentaResumen(), j = JSON.stringify(r);
    if (j === lastMirror) return;
    try { await db.doc("cuentas/" + S.uid).set(r); lastMirror = j; } catch(e){}
  }, now ? 200 : 2500);
}
function afterWrite(){ mirrorCuenta(); }

function demoRecords(){
  const td = today();
  return [
    { id:"demo-tesis", tipo:"tarea", titulo:"Entregar avance de tesis", descripcion:"Capítulo 2 con observaciones de la asesora.", fecha:addDays(td, 2), hora:null, prioridad:"alta", estado:"pendiente", area:"estudios" },
    { id:"demo-presentacion", tipo:"tarea", titulo:"Revisar presentación del proyecto", descripcion:"", fecha:td, hora:null, prioridad:"media", estado:"en_progreso", area:"trabajo" },
    { id:"demo-seguimiento", tipo:"reunion", titulo:"Reunión de seguimiento", descripcion:"Revisar avances del proyecto con el equipo.", fecha:addDays(td, 1), hora:"10:00", prioridad:"media", estado:"confirmada", area:"trabajo" },
    { id:"demo-gatos", tipo:"tarea", titulo:"Comprar alimento para los gatos", descripcion:"", fecha:td, hora:null, prioridad:"baja", estado:"pendiente", area:"hogar" },
    { id:"demo-resumen", tipo:"tarea", titulo:"Preparar resumen de reunión", descripcion:"", fecha:addDays(td, -1), hora:null, prioridad:"media", estado:"completada", area:"trabajo" }
  ];
}
function buildRecord(d, prev){
  const now = new Date().toISOString();
  const rec = {
    k:"registro", tipo:d.tipo, titulo:String(d.titulo || "").trim().slice(0, 80), descripcion:(d.descripcion || "").trim(),
    fecha:d.fecha || null, hora:(d.tipo === "nota" ? null : d.hora || null),
    prioridad:d.prioridad || "media", area:areaKey(d.area),
    estado:d.estado || (isEventLike(d) ? "confirmada" : "pendiente"),
    meta_id:d.meta_id || null, origen:d.origen || prev?.origen || "manual",
    creado:prev?.creado || now, actualizado:now,
    sync_proveedor: isEventLike(d) ? "google_calendar" : null, sync_estado: isEventLike(d) ? (prev?.sync_estado || "no_conectado") : null, sync_external_id: prev?.sync_external_id || null
  };
  if (d.confianza_ia != null) rec.confianza_ia = d.confianza_ia;
  if (d.sin_cambios != null) rec.sin_cambios = d.sin_cambios;
  return rec;
}
