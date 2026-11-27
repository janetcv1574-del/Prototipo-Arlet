/* =====================================================================
   CONFIGURACIÓN DE ARLET: precios, límites y dominios en un solo lugar.
   Cambia aquí y vuelve a construir con ./build.sh. Nada de esto está
   repetido en el resto del código.
   Todos los precios están en soles e incluyen IGV.
   ===================================================================== */
const ARLET_CONFIG = {
  soporte: "soporte@tu-dominio.com",           // correo de soporte (cámbialo)
  moneda: "S/",
  modo_demo: true,                             // sin cobros reales: los planes se activan con un botón

  prueba: { dias: 14, aviso_dias_antes: 3 },   // prueba de Plus al terminar la entrevista, sin tarjeta
  gracia_dias: 3,                              // días de Plus después de un pago fallido
  avisos_plus_por_dia: 1,                      // máximo de avisos de Plus que Arlet muestra por su cuenta
  aviso_capturas_en: 25,                       // aviso suave al llegar a esta captura en Gratis

  planes: {
    gratis:     { nombre: "Arlet Gratis",    mensual: 0,     capturas_mes: 30,  plus: false },
    plus:       { nombre: "Arlet Plus",      mensual: 14.90, anual: 119, capturas_mes: 600, plus: true },
    estudiante: { nombre: "Plus Estudiante", mensual: 8.90,  capturas_mes: 600, plus: true, reverificar_meses: 12 },
    fundadora:  { nombre: "Oferta de fundadora", primer_anio: 79, renueva_anual: 119, cupos: 100, capturas_mes: 600, plus: true }
  },

  /* Qué necesita Plus. Lo que no está aquí es para todas las cuentas.
     En Gratis, lo de Plus queda visible en modo solo lectura: nunca se borra nada. */
  funciones_plus: {
    autonomia: "Guardar directo lo que tengo claro (niveles 2 y 3)",
    metas: "Crear y editar metas y hábitos en Mi vida",
    checkin: "Marcar tus hábitos con \"Hoy fui\"",
    diario_propuestas: "Agregar las tareas y recuerdos que te propongo desde tu diario",
    memoria_aprende: "Que aprenda de tus correcciones y de tu diario",
    gcal: "Conectar Google Calendar con varias cuentas (próximamente)"
  },

  /* Correos universitarios aceptados para Plus Estudiante (terminación del dominio). */
  dominios_estudiante: [".edu.pe", ".edu", ".edu.co", ".edu.mx", ".edu.ar", ".edu.ec", ".edu.bo", ".edu.cl", ".edu.uy", ".edu.py", ".edu.ve", ".ac.uk", ".edu.es"]
};
