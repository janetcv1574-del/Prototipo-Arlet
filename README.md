# Arlet (prototipo)

Arlet es la mano derecha de jóvenes profesionales y universitarios. Hay dos versiones, hechas con las mismas piezas de `src/`:

| | claude.ai (`arlet.html`) | Web en Vercel (`public/index.html`) |
|---|---|---|
| Quién la abre | Personas con cuenta de Claude a las que se la compartes | Cualquiera con el enlace |
| Dónde se guardan los datos | Espacio privado de cada cuenta en claude.ai | Solo en el navegador de cada persona |
| IA | Incluida, gratis | Claude por API: se paga por uso (céntimos) |
| Panel de admin | Sí | No (no hay cuentas) |

## Cómo está armado

```
src/0-config.js       PRECIOS, LÍMITES, días de prueba, gracia, cupos y dominios universitarios (un solo lugar)
src/planes.js         lógica de planes: la función única de permisos, la prueba, la renovación, cancelar y pagos
src/1-core.js …       el resto de la app (datos, IA, pantallas, acciones)
api/ia.js             función del servidor en Vercel: guarda la clave de Claude y hace la llamada
build-web.sh          arma public/index.html para Vercel
vercel.json           le dice a Vercel cómo armar y qué publicar
.env.example          las variables que van en Vercel
src/*.css, *.html     estilos (tokens de DESIGN.md) y el esqueleto de la página
tests/planes.test.js  pruebas de la lógica de planes
build.sh              une todo en arlet.html, que es lo que se publica
DESIGN.md             sistema de diseño y voz de Arlet
```

Para cambiar un precio o un límite, edita `src/0-config.js` y corre `./build.sh`.

Para correr las pruebas (no gastan saldo: Claude está simulado):

```bash
npm install
```

```bash
npm test
```

## Publicar en Vercel, paso a paso

1. **Clave de Claude.** Entra a <https://console.anthropic.com>, crea tu cuenta y carga saldo (se paga por adelantado). En **Settings → Limits** pon un límite de gasto mensual, por ejemplo US$ 5. En **API Keys → Create Key** crea una clave y cópiala. No la compartas con nadie, ni la pegues en un chat.
2. **Importar el proyecto.** En <https://vercel.com>, elige **Add New → Project**, conecta tu cuenta de GitHub y elige el repositorio de Arlet. En "Framework Preset" deja **Other**. No cambies nada más: `vercel.json` ya dice cómo armarlo.
3. **Poner la clave.** Antes de publicar, abre **Environment Variables** y agrega `ANTHROPIC_API_KEY` con la clave del paso 1. Las demás variables de `.env.example` son opcionales.
4. **Deploy.** Toca **Deploy**. En un minuto tendrás tu enlace, por ejemplo `arlet-tu-usuario.vercel.app`.
5. **Probar.** Abre el enlace, haz la entrevista y escribe "Entregar avance de tesis el viernes". Si ves "Interpretado con IA", todo está bien. Si ves "Interpretación básica", revisa que la clave esté bien puesta y vuelve a publicar (**Deployments → Redeploy**).

Cada vez que se sube un cambio a GitHub, Vercel publica la nueva versión solo.

**Costo:** con Claude Haiku 5.5, una captura cuesta menos de un décimo de céntimo de dólar: unos US$ 0.40 por cada 1,000 capturas. El plan gratis de Vercel sirve mientras Arlet sea un prototipo sin cobros.

**Protección de tu saldo:** la función solo acepta llamadas desde la propia app, limita a 30 llamadas por hora por conexión, corta textos muy largos y respuestas muy largas. Ese límite es simple (vive en la memoria del servidor), así que **el límite de gasto en la consola de Anthropic es tu protección principal**.

## Planes: modo demostración

`modo_demo: true` en `src/0-config.js`. Mientras esté así:

- No hay cobros reales. "Activar (demo)" cambia el plan al instante.
- En **Tu cuenta → Tu plan** hay herramientas de demostración para simular un pago rechazado, un pago aprobado, el fin de los días de gracia, el fin del periodo, quedar a 3 días del fin de la prueba y sumar capturas usadas.
- El código de Plus Estudiante se muestra en pantalla en lugar de enviarse por correo.
- Los límites se cuentan en el navegador. Alguien con conocimientos técnicos podría saltárselos. Para un prototipo con pocas personas está bien; para cobrar de verdad, tiene que hacerse en un servidor (ver abajo).

Qué incluye cada plan está en `funciones_plus` de la configuración. Al volver a Gratis **no se borra nada**: lo de Plus queda visible en modo solo lectura.

Decisiones tomadas en este prototipo:
- En Gratis, el diario se puede escribir y leer, y la respuesta de cuidado ante una crisis funciona en todos los planes. Las propuestas del diario (agregar tareas o recuerdos) son de Plus.
- Los mensajes de "esto es parte de Plus" que aparecen cuando tú tocas algo de Plus no cuentan para el límite de un aviso al día. Ese límite aplica a los avisos que Arlet muestra por su cuenta en Inicio.
- La Oferta de fundadora cuesta S/ 79 el primer año y luego se renueva como Plus anual a S/ 119. Se cambia en `renueva_anual`.

## Pendiente: boletas electrónicas (SUNAT)

La emisión de boletas electrónicas ante SUNAT **queda pendiente de definir con un contador**. No está implementada. Antes de cobrar de verdad, defínelo con un contador: si emites como persona natural con negocio o como empresa, el tipo de comprobante y el proveedor de facturación electrónica.

## Cuando quieras cobrar de verdad

Hace falta una app con servidor, porque una página no puede recibir los avisos de pago de Mercado Pago ni guardar claves secretas. El plan es el del prompt original: Next.js, Supabase con Row Level Security y un hosting con servidor. La lógica de `src/planes.js` ya está separada para llevarla a `lib/permisos` y `lib/pagos` sin rehacerla. Los pagos se confirmarán solo por webhook con verificación de firma, nunca por la redirección del navegador.

### Crear tus credenciales de prueba de Mercado Pago (cuando llegue el momento)

1. Entra a <https://www.mercadopago.com.pe/developers> con tu cuenta de Mercado Pago Perú (si no tienes, créala; es gratis).
2. Ve a **Tus integraciones** y elige **Crear aplicación**. Ponle un nombre (por ejemplo, "Arlet") y elige el producto **Suscripciones** o **Pagos online**.
3. Dentro de la aplicación, abre **Credenciales de prueba**. Ahí verás la **Public key** y el **Access token** de prueba. No compartas el Access token con nadie.
4. En **Cuentas de prueba**, crea dos: una de **vendedor** y una de **comprador**. Con la de comprador harás las compras de prueba.
5. Busca en la documentación de Mercado Pago las **tarjetas de prueba**: sirven para simular un pago aprobado o rechazado según el nombre del titular que escribas.
6. En **Webhooks → Configurar notificaciones**, pon la dirección de tu servidor (por ejemplo, `https://tu-app/api/pagos/webhook`), marca los eventos de suscripciones y guarda. Copia la **clave secreta**: sirve para verificar la firma de cada aviso.
7. Esas claves irán en variables de entorno del servidor (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`), nunca en el código ni en la página.

Costos: crear la cuenta y usar el modo de pruebas es gratis. Mercado Pago cobra una comisión por cada pago real. Fuera de claude.ai, la IA se paga por uso con una clave de la API de Anthropic.

## Checklist de pruebas manuales (modo demo)

Ver la sección final de la respuesta en la conversación, o seguir estos pasos dentro de Arlet:

1. Cuenta nueva: termina la entrevista y confirma el aviso de 14 días de Plus.
2. Tu cuenta → Tu plan: dice "Prueba gratis" con los días restantes.
3. "Dejar 3 días de prueba" y luego Inicio: aparece "Te quedan 3 días de Plus. ¿Seguimos juntas?".
4. "Adelantar al fin del periodo": la cuenta pasa a Gratis, las metas siguen visibles y "Crear meta" muestra "Esto es parte de Plus".
5. "Sumar 5 capturas usadas" hasta 25: aviso suave en Inicio. Hasta 30: en Capturar aparece el aviso de las 30 capturas y la lectura básica.
6. Precios: cambia entre mensual y anual y revisa el ahorro de S/ 59.80. Activa Plus.
7. "Simular pago rechazado": aviso amable en Inicio y 3 días de gracia. "Terminar los días de gracia": vuelve a Gratis sin perder datos.
8. Plus Estudiante: prueba con un Gmail (debe rechazarlo) y con un correo `.edu.pe`, y escribe el código.
9. Cancela: mantienes Plus hasta el fin del periodo.
10. Admin: revisa usuarias por plan, ingresos simulados, conversión, cancelaciones y cupos de fundadora.
