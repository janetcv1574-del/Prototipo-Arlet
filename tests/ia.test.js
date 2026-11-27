// Pruebas de la función del servidor /api/ia, con un cliente de Claude simulado (no gasta saldo).
import { test } from "node:test";
import assert from "node:assert/strict";
import { crearHandler, extraerJSON } from "../api/ia.js";

function resFalsa(){
  const r = { code:200, body:null, headers:{} };
  r.status = c => { r.code = c; return r; };
  r.json = b => { r.body = b; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  return r;
}
const req = (body, extra = {}) => ({ method:"POST", body, headers:{ host:"arlet.vercel.app", origin:"https://arlet.vercel.app", "x-forwarded-for":"1.1.1.1", ...(extra.headers || {}) } });
const cliente = respuesta => ({ calls:[], messages:{ create: async function(p){ this.calls = (this.calls || []); this.calls.push(p); return respuesta; } } });
const ok = texto => ({ stop_reason:"end_turn", content:[{ type:"text", text:texto }] });

test("Devuelve el JSON que responde Claude", async () => {
  const c = cliente(ok('{"tipo":"tarea","titulo":"Entregar avance de tesis"}'));
  const res = resFalsa();
  await crearHandler({ cliente:c })(req({ prompt:"Entregar avance de tesis el viernes" }), res);
  assert.equal(res.code, 200); assert.equal(res.body.data.titulo, "Entregar avance de tesis");
  assert.equal(c.messages.calls[0].model, "claude-haiku-5-5");
});
test("Acepta JSON dentro de un bloque de código", () => {
  assert.deepEqual(extraerJSON('```json\n[{"a":1}]\n```'), [{ a:1 }]);
  assert.deepEqual(extraerJSON('Claro: {"a":2}'), { a:2 });
});
test("Rechaza métodos que no son POST y entradas vacías o enormes", async () => {
  const h = crearHandler({ cliente:cliente(ok("{}")) });
  let res = resFalsa(); await h({ method:"GET", headers:{} }, res); assert.equal(res.code, 405);
  res = resFalsa(); await h(req({ prompt:"" }), res); assert.equal(res.code, 400);
  res = resFalsa(); await h(req({ prompt:"x".repeat(15001) }), res); assert.equal(res.code, 400);
});
test("No acepta llamadas desde otro sitio", async () => {
  const res = resFalsa();
  await crearHandler({ cliente:cliente(ok("{}")) })(req({ prompt:"hola" }, { headers:{ origin:"https://otro.com" } }), res);
  assert.equal(res.code, 403);
});
test("Límite por hora: la llamada 31 se frena", async () => {
  let t = 0; const h = crearHandler({ cliente:cliente(ok("{}")), ahora:() => t, limite:30 });
  for (let i = 0; i < 30; i++) { const r = resFalsa(); await h(req({ prompt:"hola" }), r); assert.equal(r.code, 200); }
  const r = resFalsa(); await h(req({ prompt:"hola" }), r); assert.equal(r.code, 429);
  t = 3600e3 + 1; const r2 = resFalsa(); await h(req({ prompt:"hola" }), r2); assert.equal(r2.code, 200, "se libera después de una hora");
});
test("Si Claude se niega, responde 422 y la app usa la lectura básica", async () => {
  const res = resFalsa();
  await crearHandler({ cliente:cliente({ stop_reason:"refusal", content:[] }) })(req({ prompt:"hola" }), res);
  assert.equal(res.code, 422);
});
test("Si la respuesta no es JSON, responde 502", async () => {
  const res = resFalsa();
  await crearHandler({ cliente:cliente(ok("no sé")) })(req({ prompt:"hola" }), res);
  assert.equal(res.code, 502);
});
test("Sin clave configurada responde 503 (nunca expone nada)", async () => {
  const antes = process.env.ANTHROPIC_API_KEY; delete process.env.ANTHROPIC_API_KEY;
  const res = resFalsa(); await crearHandler()(req({ prompt:"hola" }), res);
  assert.equal(res.code, 503); assert.equal(JSON.stringify(res.body).includes("sk-"), false);
  if (antes) process.env.ANTHROPIC_API_KEY = antes;
});
