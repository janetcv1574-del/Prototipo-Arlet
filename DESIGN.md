# Arlet — Sistema de diseño

> La mano derecha de jóvenes profesionales y universitarios que equilibran trabajo, estudios y vida personal.
> **Sensaciones objetivo:** confianza · autonomía · profesionalismo, con calidez.

---

## 0. Principios de dirección de arte

| Sensación | Cómo se traduce en diseño |
|---|---|
| **Confianza** | Azul profundo como ancla, layouts estables y predecibles, nada que "salte" sin razón, datos siempre legibles. |
| **Autonomía** | Un acento cálido (ámbar) que marca *lo que el usuario decide*: metas, prioridades, logros. Mucho aire en blanco: la interfaz no presiona. |
| **Profesionalismo** | Tipografía sobria, retícula de 4 px, sombras sutiles, cero decoración gratuita. Se ve como una herramienta seria, no como un juguete. |

**Regla de oro:** si un elemento no ayuda a decidir o a actuar, sobra.

---

## 1. Paleta de color

### 1.1 Colores de marca

| Token | Hex | Nombre | Uso |
|---|---|---|---|
| `--color-primary-900` | `#16324F` | Azul Profundo | Color identitario. Logo, encabezados de pantalla, barra de navegación, fondos de secciones destacadas (hero, onboarding). Transmite confianza. |
| `--color-primary-600` | `#2457C5` | Azul Acción | Botón primario, enlaces, estados activos (tab seleccionada, toggle encendido), foco. Es *el* color que dice "aquí se actúa". |
| `--color-primary-100` | `#E6EEFB` | Azul Bruma | Fondos de chips seleccionados, filas resaltadas, fondo de tarjetas informativas, hover de elementos secundarios. |
| `--color-accent-500` | `#F2A93B` | Ámbar Autonomía | Acento de uso limitado: metas propias, racha/progreso personal, badge "Prioridad", ilustraciones. **Nunca** como color de texto sobre blanco ni en botones de acción principal. |
| `--color-accent-100` | `#FDF1DC` | Ámbar Suave | Fondo de tarjetas de metas, banners de logro, notas fijadas. |

### 1.2 Neutrales

| Token | Hex | Uso |
|---|---|---|
| `--color-ink` | `#121826` | Texto principal y títulos. |
| `--color-gray-700` | `#374151` | Texto secundario de alta importancia (subtítulos, labels). |
| `--color-gray-500` | `#6B7280` | Texto de apoyo, placeholders, metadatos (fechas, horas). Mínimo aceptable sobre blanco. |
| `--color-gray-300` | `#D1D5DB` | Bordes de inputs, divisores, estados deshabilitados. |
| `--color-gray-100` | `#F3F4F6` | Fondo de inputs, áreas de agrupación, skeleton loaders. |
| `--color-canvas` | `#F8F7F4` | Fondo general de la app (blanco cálido, menos frío y cansador que el blanco puro). |
| `--color-surface` | `#FFFFFF` | Tarjetas, modales, hojas inferiores. |

### 1.3 Semánticos

| Token | Hex | Fondo asociado | Uso |
|---|---|---|---|
| `--color-success` | `#1F8A5B` | `#E5F4EC` | Tarea completada, guardado correcto, confirmaciones. |
| `--color-warning` | `#B7791F` | `#FBF0DD` | Vencimientos próximos, conflictos de horario, acciones reversibles con impacto. |
| `--color-error` | `#C23B3B` | `#FBE7E7` | Errores de validación, fallas de conexión, acciones destructivas. |
| `--color-info` | `#2457C5` | `#E6EEFB` | Tips, novedades, mensajes neutrales del asistente. |

> Nunca comunicar un estado **solo** con color: siempre acompañar con ícono y texto.

### 1.6 Colores de área (paleta derivada)

Además de Trabajo, Estudios y Personal, cada área de vida tiene su color. Se usan **solo** como franja de 4 px, punto de leyenda o pastilla del calendario, nunca como color de texto. Todos superan 3:1 contra `surface` en su modo.

| Área | Token | Claro | Oscuro |
|---|---|---|---|
| Trabajo | `--area-trabajo` | `#2457C5` | `#6C9BFF` |
| Estudios | `--area-estudios` | `#6B5BD2` | `#9D8FF0` |
| Salud y ejercicio | `--area-salud` | `#1E8C6E` | `#4CC3A0` |
| Viajes | `--area-viajes` | `#0E7C9E` | `#4DB8D9` |
| Finanzas | `--area-finanzas` | `#6B7F2A` | `#A8BF5A` |
| Hogar y mascotas | `--area-hogar` | `#B0582B` | `#E88C5D` |
| Familia y amistades | `--area-familia` | `#C2477A` | `#EB82AE` |
| Hobbies | `--area-hobbies` | `#8C6A2E` | `#C9A466` |
| Personal / Otra | `--area-personal` | `#F2A93B` | `#F5B85A` |

### 1.7 Logo

Cuadrado de radio 9 (sobre 32) en Azul Profundo con una "A" geométrica blanca de trazo 3 y terminaciones redondeadas. El travesaño es un trazo **ámbar**: lo que la persona decide. Sobre fondos Azul Profundo (barra lateral, portada) el cuadrado pasa a Azul Acción. Junto al ícono va "Arlet" en Manrope 700.

### 1.4 Proporción de uso (regla 60/30/10)

- **60 %** neutrales claros (`canvas`, `surface`)
- **30 %** azules (`primary-900`, `primary-600`, `primary-100`) y texto `ink`
- **10 %** ámbar y semánticos

### 1.5 Modo oscuro

| Token | Claro | Oscuro |
|---|---|---|
| `canvas` | `#F8F7F4` | `#0E1624` |
| `surface` | `#FFFFFF` | `#16202F` |
| `ink` | `#121826` | `#EEF1F6` |
| `gray-500` | `#6B7280` | `#9AA4B2` |
| `gray-300` | `#D1D5DB` | `#2C3A4D` |
| `primary-600` | `#2457C5` | `#6C9BFF` |
| `primary-100` | `#E6EEFB` | `#1B2D4D` |
| `accent-500` | `#F2A93B` | `#F5B85A` |

En oscuro se eliminan las sombras y la elevación se comunica aclarando la superficie.

---

## 2. Tipografía

### 2.1 Familias

| Rol | Familia | Por qué |
|---|---|---|
| **Títulos** | **Manrope** (600 / 700) | Geométrica, moderna y firme. Se siente segura sin ser corporativa ni fría. |
| **Texto e interfaz** | **Inter** (400 / 500 / 600) | Máxima legibilidad en pantalla, excelente en tamaños pequeños y con números tabulares. |
| **Datos / horas** | Inter con `font-variant-numeric: tabular-nums` | Horarios, montos y porcentajes alineados en columnas. |

Ambas disponibles gratis en Google Fonts. Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

### 2.2 Escala tipográfica (móvil primero)

| Token | Familia | Tamaño | Interlineado | Peso | Tracking | Uso |
|---|---|---|---|---|---|---|
| `display` | Manrope | 32 px | 40 px | 700 | −0.5 px | Bienvenida, onboarding, pantallas vacías. |
| `h1` | Manrope | 24 px | 32 px | 700 | −0.3 px | Título de pantalla. |
| `h2` | Manrope | 20 px | 28 px | 600 | −0.2 px | Título de sección. |
| `h3` | Manrope | 17 px | 24 px | 600 | 0 | Título de tarjeta. |
| `body-lg` | Inter | 17 px | 26 px | 400 | 0 | Mensajes del asistente, lectura larga. |
| `body` | Inter | 15 px | 22 px | 400 | 0 | Texto estándar. |
| `label` | Inter | 14 px | 20 px | 500 | 0 | Labels de formularios, botones. |
| `caption` | Inter | 13 px | 18 px | 400 | 0 | Metadatos, ayudas bajo inputs. |
| `overline` | Inter | 12 px | 16 px | 600 | +0.6 px, MAYÚSCULAS | Etiquetas de categoría ("TRABAJO", "ESTUDIOS", "PERSONAL"). |

En escritorio (≥ 1024 px) multiplicar `display`, `h1` y `h2` por 1.25; el resto se mantiene.

### 2.3 Reglas

- Máximo **dos pesos** por pantalla además del regular.
- Ancho de línea ideal: 60–75 caracteres.
- Nada de texto en cursiva para énfasis; usar peso 600.
- Nunca texto menor a 12 px.

---

## 3. Espaciado y retícula

Base de **4 px**. Solo se usan estos valores:

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4 px | Ícono ↔ texto pequeño. |
| `space-2` | 8 px | Elementos dentro de un chip o botón. |
| `space-3` | 12 px | Entre label e input. |
| `space-4` | 16 px | Padding interno de tarjetas; margen lateral en móvil. |
| `space-5` | 20 px | Separación entre tarjetas. |
| `space-6` | 24 px | Padding de modales; margen lateral en tablet. |
| `space-8` | 32 px | Entre secciones. |
| `space-12` | 48 px | Separación de bloques mayores. |
| `space-16` | 64 px | Respiro superior en pantallas de onboarding. |

**Retícula:** 4 columnas en móvil (margen 16 px, gutter 16 px) · 8 en tablet (24/24) · 12 en escritorio (contenedor máx. 1200 px, gutter 24 px).

**Áreas táctiles:** mínimo 44 × 44 px.

---

## 4. Bordes y radios

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 6 px | Chips, badges, checkboxes. |
| `radius-md` | 10 px | Botones, inputs, selects. |
| `radius-lg` | 16 px | Tarjetas, contenedores. |
| `radius-xl` | 24 px | Modales, hojas inferiores (solo esquinas superiores). |
| `radius-full` | 999 px | Avatares, toggles, indicador de progreso. |

**Grosores de borde:**
- 1 px `gray-300` — inputs en reposo, divisores, tarjetas sin sombra.
- 2 px `primary-600` — foco (con anillo exterior de 2 px `primary-100`).
- 1.5 px `error` — input con error.

Radios moderados, ni cuadrados (rígido) ni muy redondos (infantil): eso es lo que comunica "profesional pero cercano".

---

## 5. Sombras y elevación

Sombras tintadas con el azul profundo (no negro puro) para que se vean limpias.

| Token | Valor CSS | Uso |
|---|---|---|
| `shadow-0` | `none` | Elementos planos sobre `canvas` con borde. |
| `shadow-1` | `0 1px 2px rgba(22, 50, 79, 0.06), 0 1px 3px rgba(22, 50, 79, 0.08)` | Tarjetas en reposo. |
| `shadow-2` | `0 4px 12px rgba(22, 50, 79, 0.10)` | Tarjeta en hover, dropdowns, botón flotante. |
| `shadow-3` | `0 12px 32px rgba(22, 50, 79, 0.16)` | Modales, hojas inferiores, toasts. |

**Regla:** como máximo dos niveles de elevación visibles a la vez.

---

## 6. Componentes clave

### Botones

| Variante | Fondo | Texto | Borde | Uso |
|---|---|---|---|---|
| Primario | `primary-600` | `#FFFFFF` | — | Una sola acción principal por pantalla. |
| Secundario | `surface` | `primary-600` | 1 px `gray-300` | Acciones alternativas. |
| Terciario / texto | transparente | `primary-600` | — | Acciones de bajo peso ("Ver todo"). |
| Destructivo | `error` | `#FFFFFF` | — | Eliminar, cancelar suscripción (siempre con confirmación). |

- Alto: 48 px (móvil), 40 px (escritorio). Padding horizontal 20 px. `radius-md`. Tipografía `label` peso 600.
- Hover: oscurecer 8 %. Presionado: oscurecer 14 %. Deshabilitado: fondo `gray-100`, texto `gray-500`.
- Cargando: spinner + verbo en gerundio ("Guardando…"); el botón conserva su ancho.

### Inputs
Alto 48 px, fondo `surface`, borde 1 px `gray-300`, `radius-md`, label siempre visible arriba (nunca solo placeholder). Mensaje de ayuda o error en `caption` debajo.

### Tarjetas
Fondo `surface`, `radius-lg`, padding `space-4`, `shadow-1`. Las tarjetas de categoría llevan una franja izquierda de 4 px:
- **Trabajo** → `primary-600`
- **Estudios** → `#6B5BD2` (violeta, solo para esta categoría)
- **Personal** → `accent-500`

---

## 7. Iconografía

- **Librería:** [Lucide](https://lucide.dev) (gratuita, consistente, open source).
- **Estilo:** línea (outline), trazo **1.5 px**, terminaciones redondeadas, sin rellenos. Relleno solo para el estado activo de la navegación inferior.
- **Tamaños:** 16 px (en línea con texto), 20 px (en botones e inputs), 24 px (navegación), 32 px (estados vacíos).
- **Color:** hereda el color del texto que acompaña; `gray-500` cuando es decorativo.
- **Reglas:** ícono + texto siempre que la acción no sea universal (solo íconos sueltos para cerrar, buscar, atrás, más). Nada de íconos 3D, degradados ni emojis en la interfaz.

---

## 8. Fotografía e ilustración

### Fotografía
- **Personas reales** de 22–32 años, diversidad latinoamericana, en contextos reales: escritorio en casa, café, aula, transporte, coworking.
- **Momento:** concentración serena o pequeño logro — nunca euforia exagerada ni estrés dramático.
- **Encuadre:** planos medios con espacio negativo para texto; preferir que la persona mire a su trabajo, no a cámara.
- **Luz:** natural, cálida, sombras suaves. Leve tratamiento: saturación −10 %, sombras ligeramente tintadas hacia azul.
- **Evitar:** stock corporativo (apretones de manos, trajes, sonrisas a cámara), pantallas con contenido legible de otras marcas, escenas de lujo.

### Ilustración
- Estilo plano y geométrico, máximo 3 colores de la paleta (azul profundo, azul bruma, ámbar) sobre `canvas`.
- Uso: estados vacíos, onboarding y logros. Nunca dentro de flujos de trabajo.

---

## 9. Voz y tono de los textos

### 9.1 Personalidad
Arlet es **tu mano derecha**: alguien de confianza que te conoce, te acompaña y te ayuda a que todo encaje. Es cálida y cercana, con los pies en la tierra. Celebra tus logros, te acompaña en las semanas pesadas y nunca te hace sentir culpable. Sugiere, no ordena: tú decides.

| Sí | No |
|---|---|
| Tutear con cariño ("Vamos por partes."). | Frialdad de sistema ("Registro creado exitosamente."). |
| Hablar de su vida real: metas, mascotas, descanso. | Ser cursi o empalagosa, o usar exclamaciones en exceso. |
| Acompañar ("Sé que es una semana cargada. Empecemos por lo de hoy."). | Culpar ("Ingresaste mal…", "Tienes 3 tareas vencidas."). |
| Proponer y dejar decidir ("¿Lo agrego?"). | Dar órdenes o decidir sin avisar. |
| Frases cortas y naturales. | Jerga técnica, mayúsculas o emojis en la interfaz. |

Si la usuaria elige el tono **directo**, Arlet es más breve, pero sigue siendo amable ("Guardado para el vie 28 nov.").

### 9.2 Botones
- **Verbo en infinitivo + objeto** cuando sea posible: "Guardar tarea", "Agregar evento", "Conectar calendario".
- Máximo 3 palabras.
- Específicos en lugar de genéricos: "Crear meta" mejor que "Aceptar"; "Sí, eliminar" mejor que "OK".
- En confirmaciones, el botón repite la acción: diálogo "¿Eliminar esta tarea?" → botones **"Cancelar"** / **"Eliminar"**.

| Contexto | ✅ Usar | ❌ Evitar |
|---|---|---|
| Formulario nuevo | Crear tarea | Enviar |
| Onboarding | Empezar | ¡Vamos allá! 🚀 |
| Integración | Conectar Google Calendar | Autorizar acceso |
| Salir sin guardar | Descartar cambios | Salir |
| Plan / meta | Fijar meta | Submit |

### 9.3 Mensajes de error
Estructura: **qué pasó + cómo resolverlo**. Tono calmado; el problema es del sistema, no de la persona.

| Situación | ✅ Mensaje |
|---|---|
| Campo obligatorio vacío | Agrega un nombre para la tarea. |
| Correo con formato inválido | Revisa el correo; parece que falta algo (ej. nombre@correo.com). |
| Contraseña débil | Usa al menos 8 caracteres, con una mayúscula y un número. |
| Sin conexión | No hay conexión. Guardamos tus cambios y los sincronizaremos al reconectarte. |
| Error del servidor | Algo falló de nuestro lado. Intenta de nuevo en unos minutos. |
| Conflicto de horario | Este evento se cruza con "Clase de Finanzas" (7:00 p. m.). ¿Quieres moverlo? |
| Fecha pasada | Esa fecha ya pasó. Elige hoy o una fecha futura. |
| Integración fallida | No pudimos conectar tu calendario. Vuelve a intentarlo o revisa los permisos. |

### 9.4 Otros mensajes
- **Éxito:** breve y cálido: "Listo, lo guardé para el viernes." / "Meta creada. Te voy contando cómo vas."
- **Estados vacíos:** invitan a actuar: "Hoy tienes el día libre de pendientes. ¿Planificamos algo para ti?"
- **Logros:** se celebran con naturalidad, con una sola exclamación: "¡Cerraste todo lo de hoy! Ahora sí, a descansar."
- **Atrasos:** sin culpa: "Quedaron 3 pendientes atrasados. ¿Los reordenamos?"
- **Toque personal:** con tacto y como mucho una vez al día: "Te quedan dos pendientes y luego Luna y Michi te esperan en casa."
- **Formato:** fechas "lun 10 nov", horas "7:00 p. m.", números con separadores locales.

---

## 10. Accesibilidad (mínimos no negociables)

- Contraste de texto normal ≥ 4.5:1; texto grande y componentes ≥ 3:1 (WCAG 2.2 AA).
- `accent-500` (ámbar) no se usa como color de texto sobre fondos claros.
- Foco visible en todos los elementos interactivos.
- Respetar `prefers-reduced-motion`: animaciones de 150–250 ms con `ease-out`, desactivables.
- Textos escalables hasta 200 % sin romper el layout.

---

## 11. Tokens listos para usar (CSS)

```css
:root {
  /* Marca */
  --color-primary-900: #16324F;
  --color-primary-600: #2457C5;
  --color-primary-100: #E6EEFB;
  --color-accent-500:  #F2A93B;
  --color-accent-100:  #FDF1DC;

  /* Neutrales */
  --color-ink:      #121826;
  --color-gray-700: #374151;
  --color-gray-500: #6B7280;
  --color-gray-300: #D1D5DB;
  --color-gray-100: #F3F4F6;
  --color-canvas:   #F8F7F4;
  --color-surface:  #FFFFFF;

  /* Semánticos */
  --color-success: #1F8A5B;  --color-success-bg: #E5F4EC;
  --color-warning: #B7791F;  --color-warning-bg: #FBF0DD;
  --color-error:   #C23B3B;  --color-error-bg:   #FBE7E7;
  --color-info:    #2457C5;  --color-info-bg:    #E6EEFB;

  /* Categorías */
  --cat-work:     #2457C5;
  --cat-study:    #6B5BD2;
  --cat-personal: #F2A93B;

  /* Tipografía */
  --font-heading: "Manrope", system-ui, sans-serif;
  --font-body:    "Inter", system-ui, sans-serif;

  /* Espaciado */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px;  --space-8: 32px; --space-12: 48px;
  --space-16: 64px;

  /* Radios */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --radius-xl: 24px; --radius-full: 999px;

  /* Sombras */
  --shadow-1: 0 1px 2px rgba(22,50,79,.06), 0 1px 3px rgba(22,50,79,.08);
  --shadow-2: 0 4px 12px rgba(22,50,79,.10);
  --shadow-3: 0 12px 32px rgba(22,50,79,.16);

  /* Movimiento */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --ease-out: cubic-bezier(.2, .8, .2, 1);
}
```

---

## 12. Checklist antes de publicar una pantalla

- [ ] ¿Hay una sola acción primaria (botón azul)?
- [ ] ¿El ámbar aparece solo en lo que el usuario decide o logra?
- [ ] ¿Todos los espacios son múltiplos de 4?
- [ ] ¿Cada error dice qué pasó y cómo resolverlo?
- [ ] ¿Los botones usan verbo + objeto?
- [ ] ¿Ningún estado se comunica solo con color?
- [ ] ¿Se ve bien en modo oscuro?
