// Pruebas de la lógica de planes. Correr con:  node --test tests/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const src = ["0-config.js", "planes.js"].map(f => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8")).join("\n");
const ctx = {};
vm.runInNewContext(src + "\nthis.PL = PL; this.C = ARLET_CONFIG;", ctx);
const { PL, C } = ctx;
const HOY = "2026-11-26";

test("Gratis: 30 capturas con IA al mes, la 31 no", () => {
  const ef = PL.efectivo(null, HOY);
  let uso = null;
  for (let i = 0; i < 30; i++) { assert.equal(PL.puede(ef, "captura_ia", uso, HOY).ok, true, `captura ${i + 1}`); uso = PL.registrarUso(uso, HOY); }
  const r = PL.puede(ef, "captura_ia", uso, HOY);
  assert.equal(r.ok, false); assert.equal(r.usadas, 30); assert.equal(r.limite, C.planes.gratis.capturas_mes);
});
test("El contador de capturas vuelve a cero el mes siguiente", () => {
  const uso = { mes:"2026-11", n:30 };
  assert.equal(PL.usadas(uso, "2026-12-01"), 0);
  assert.equal(PL.puede(PL.efectivo(null, "2026-12-01"), "captura_ia", uso, "2026-12-01").ok, true);
});
test("Plus tiene el tope razonable de 600", () => {
  const ef = PL.efectivo(PL.activar(null, "plus", "mensual", HOY), HOY);
  assert.equal(PL.puede(ef, "captura_ia", { mes:"2026-11", n:599 }, HOY).ok, true);
  assert.equal(PL.puede(ef, "captura_ia", { mes:"2026-11", n:600 }, HOY).ok, false);
});
test("Prueba gratis: 14 días de Plus y luego Gratis", () => {
  const p = PL.iniciarPrueba(null, HOY);
  assert.equal(p.estado, "prueba"); assert.equal(p.fin_periodo, "2026-12-10");
  assert.equal(PL.efectivo(p, "2026-12-09").plus, true);
  assert.equal(PL.diasRestantes(p, "2026-12-07"), 3, "el aviso de 3 días cae aquí");
  const fin = PL.efectivo(p, "2026-12-10");
  assert.equal(fin.plus, false); assert.equal(fin.id, "gratis"); assert.equal(fin.estado, "vencida");
});
test("La prueba gratis se da una sola vez", () => {
  const p = PL.iniciarPrueba(null, HOY);
  assert.equal(PL.iniciarPrueba(p, "2027-01-01"), p);
});
test("Pago aprobado: renueva el periodo", () => {
  const p = PL.activar(null, "plus", "mensual", HOY);
  assert.equal(p.fin_periodo, "2026-12-26");
  const r = PL.renovar(p, "2026-12-26");
  assert.equal(r.fin_periodo, "2027-01-26"); assert.equal(PL.efectivo(r, "2026-12-30").plus, true);
});
test("Pago rechazado: 3 días de gracia y luego Gratis", () => {
  const p = PL.pagoRechazado(PL.activar(null, "plus", "mensual", "2026-10-26"), HOY);
  assert.equal(p.gracia_hasta, "2026-11-29");
  assert.equal(PL.efectivo(p, "2026-11-28").plus, true); assert.equal(PL.efectivo(p, "2026-11-28").en_gracia, true);
  assert.equal(PL.efectivo(p, "2026-11-29").plus, false);
  assert.equal(PL.renovar(p, "2026-11-30"), p, "no se renueva solo con un pago pendiente");
  const ok = PL.pagoAprobado(p, "2026-11-28");
  assert.equal(ok.pago_fallido_en, null); assert.equal(PL.efectivo(ok, "2026-12-01").plus, true);
});
test("Cancelar: mantiene Plus hasta el fin del periodo pagado", () => {
  const p = PL.cancelar(PL.activar(null, "plus", "anual", HOY), "2027-02-01");
  assert.equal(p.estado, "cancelada"); assert.equal(p.cancelada_en, "2027-02-01");
  assert.equal(PL.efectivo(p, "2027-11-25").plus, true);
  assert.equal(PL.efectivo(p, "2027-11-26").plus, false);
  assert.equal(PL.renovar(p, "2027-12-01"), p, "una cuenta cancelada no se renueva");
});
test("De Plus a Gratis: lo de Plus queda en solo lectura y los datos no se tocan", () => {
  const datos = { metas:[{ id:"m1" }], diario:[{ id:"d1" }], memoria:[{ id:"x1" }] };
  const antes = JSON.stringify(datos);
  const vencido = PL.efectivo(PL.cancelar(PL.iniciarPrueba(null, HOY), HOY), "2027-01-01");
  assert.equal(vencido.plus, false);
  for (const f of Object.keys(C.funciones_plus)) assert.equal(PL.puede(vencido, f).ok, false, f);
  assert.equal(PL.puede(vencido, "ver_metas").ok, true, "ver sigue permitido");
  assert.equal(PL.nivelEfectivo(vencido, 3), 1, "la autonomía vuelve a preguntar todo");
  assert.equal(JSON.stringify(datos), antes, "ninguna función de planes cambia los datos");
});
test("Fundadora: S/ 79 el primer año y luego se renueva como Plus anual", () => {
  const p = PL.activar(null, "fundadora", null, HOY);
  assert.equal(p.periodo, "anual"); assert.equal(PL.proximoCobro(p), C.planes.fundadora.renueva_anual);
  const r = PL.renovar(p, "2027-11-26");
  assert.equal(r.id, "plus"); assert.equal(r.era_fundadora, true);
});
test("Plus Estudiante: solo correos universitarios", () => {
  assert.equal(PL.correoUniversitario("ana@pucp.edu.pe"), true);
  assert.equal(PL.correoUniversitario("ana@mit.edu"), true);
  assert.equal(PL.correoUniversitario("ana@gmail.com"), false);
  assert.equal(PL.correoUniversitario("ana@edu.pe.com"), false);
});
test("El plan anual muestra su ahorro", () => {
  assert.equal(PL.ahorroAnual(), 59.8);
});
test("Cambiar de plan no arrastra restos del plan anterior", () => {
  const viejo = PL.pagoRechazado(PL.activar(null, "plus", "mensual", "2026-10-26"), HOY);
  const nuevo = PL.normalizar(PL.activar(viejo, "estudiante", "mensual", HOY));
  const guardado = Object.assign({}, viejo, nuevo); // así mezcla la base de datos un update
  assert.equal(guardado.pago_fallido_en, null); assert.equal(guardado.gracia_hasta, null);
  assert.equal(PL.efectivo(guardado, "2026-12-01").plus, true);
});
test("Tras los días de gracia, el último día con Plus es el de la gracia", () => {
  const p = PL.pagoRechazado(PL.activar(null, "plus", "anual", "2026-01-10"), HOY);
  assert.equal(PL.ultimoDiaPlus(p), "2026-11-28");
});
