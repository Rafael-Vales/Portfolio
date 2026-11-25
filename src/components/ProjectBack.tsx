"use client";
import { useLocale } from "./LocaleProvider";
const details = [
 { title:["Una idea, un producto propio.","An idea. A product of my own."], intro:["TripPilot es un proyecto personal para reunir la planificación y el día a día de un viaje en una experiencia nativa para iPhone.","TripPilot is a personal project that brings travel planning and the day-to-day journey together in a native iPhone experience."],
 role:["Diseñé la aplicación y desarrollé su experiencia, desde las pantallas hasta la lógica de planificación.","I designed the app and developed its experience, from the screens to the planning logic."],
 decision:["Arquitectura DDD de cuatro capas con MVVM. Persistencia con SwiftData, mapas con MapKit y un motor heurístico para planificar itinerarios.","A four-layer DDD architecture with MVVM. SwiftData persistence, MapKit maps and a heuristic engine for itinerary planning."],
 stack:["Swift","SwiftUI","SwiftData","MapKit"], status:["En desarrollo · Próximamente en App Store","In development · Coming to the App Store"] },
 { title:["De un negocio real a una tienda online.","From a real business to an online store."], intro:["El ecommerce de Los Abuelos Pet Shop: un proyecto realizado durante mi pasantía, trabajando sobre las necesidades del comercio.","The Los Abuelos Pet Shop ecommerce platform: a project built during my internship around the needs of the business."],
 role:["Desarrollé el catálogo, carrito, checkout y ciclo de órdenes de punta a punta.","I developed the catalog, cart, checkout and order lifecycle end to end."],
 decision:["Integración con MercadoPago: claves de idempotencia, validación de webhooks y reconciliación con reintentos para evitar cobros duplicados.","MercadoPago integration: idempotency keys, webhook validation and reconciliation with retries to prevent duplicate charges."],
 stack:["Next.js","TypeScript","Prisma","PostgreSQL","MercadoPago"], status:["Demo disponible · Productos de ejemplo y compra simulada","Demo available · Sample products and simulated checkout"] },
 { title:["De la reserva al seguimiento de la consulta.","From booking to clinical follow-up."], intro:["La tesis parte de un circuito real: coordinar turnos por WhatsApp y confirmar la reserva al recibir una seña. El sistema reúne la reserva móvil, la agenda de recepción, la revisión de comprobantes y el seguimiento clínico.","The thesis starts with a real workflow: scheduling appointments on WhatsApp and confirming bookings after a deposit. The system brings together mobile booking, the reception schedule, receipt review, and clinical follow-up."],
 role:["Lideré técnicamente un equipo de cuatro personas. Trabajo con la clienta y el equipo para llevar el flujo del consultorio a la aplicación y verificar los recorridos antes de incorporarlos.","I led the technical work of a four-person team. I work with the client and the team to bring the clinic’s workflow into the application and test each journey before integrating it."],
 decision:["Las retenciones temporales protegen el horario mientras se completa la reserva. Para los datos clínicos, la autorización del servidor y las políticas RLS de Supabase separan los permisos de recepción y dermatología. Las correcciones se conservan como nuevos registros para mantener la trazabilidad.","Temporary holds protect the time slot while the booking is completed. For clinical data, server-side authorization and Supabase RLS policies separate reception and dermatology permissions. Corrections are stored as new records to preserve the audit trail."],
 stack:["Next.js","TypeScript","Prisma","PostgreSQL","Supabase"], status:["En desarrollo · Flujos demostrativos con datos ficticios · Sin puesta en producción","In development · Demonstration workflows with fictional data · Not yet in production"] }
];
export default function ProjectBack({ index }: { index: number }) {
 const {t}=useLocale(); const d=details[index];
 return <div className="project-back-content">
   <span className="case-eyebrow">{t("Detrás del proyecto","Behind the project")}</span>
   <h3>{t(d.title[0],d.title[1])}</h3><p className="case-intro">{t(d.intro[0],d.intro[1])}</p>
   <div className="case-columns"><div><h4>{t("Mi aporte","My contribution")}</h4><p>{t(d.role[0],d.role[1])}</p></div><div><h4>{t("Una decisión técnica","A technical decision")}</h4><p>{t(d.decision[0],d.decision[1])}</p></div></div>
   {index === 2 && (
     <div className="case-clinic-scope">
       <h4>{t("Flujos del sistema", "System workflows")}</h4>
       <ul>
         <li>{t("Pacientes: reserva desde el celular, carga del comprobante y consulta de próximos turnos.", "Patients: mobile booking, uploading proof of payment, and checking upcoming appointments.")}</li>
         <li>{t("Recepción: agenda con disponibilidad y bloqueos, revisión de señas, devoluciones e historial de pagos.", "Reception: schedule availability and time blocks, deposit review, refunds, and payment history.")}</li>
         <li>{t("Dermatología: ficha clínica, evoluciones, fotos e indicaciones con acceso por rol.", "Dermatology: patient records, progress notes, photos, and care instructions with role-based access.")}</li>
         <li>{t("Administración: configuración de tipos de turno, coberturas y condiciones de seña, con estadísticas de la operación.", "Administration: appointment types, coverage, and deposit rules, plus operational statistics.")}</li>
       </ul>
     </div>
   )}
   <ul className="case-stack">{d.stack.map(s=><li key={s}>{s}</li>)}</ul>
   <small>{t(d.status[0],d.status[1])}</small>
 </div>;
}
