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
 { title:["De un problema cotidiano a un sistema clínico.","From an everyday problem to a clinical system."], intro:["El consultorio coordina turnos por WhatsApp y confirma la reserva al recibir una seña. El proyecto nace para ordenar ese circuito y conectar la gestión administrativa con la atención dermatológica.","The clinic coordinates appointments over WhatsApp and confirms bookings after receiving a deposit. The project aims to organize that workflow and connect administration with dermatology care."],
 role:["Como Tech Lead de un equipo de cuatro, trabajo en el relevamiento con la clienta, el diseño del modelo de datos y las decisiones técnicas. El alcance se define con el consultorio y el trabajo se organiza con Scrum y Jira.","As Tech Lead of a four-person team, I work on requirements gathering with the client, data model design and technical decisions. Scope is defined with the clinic, and work is organized with Scrum and Jira."],
 decision:["El diseño contempla retenciones temporales de turnos y conflictos de reserva. Para los datos clínicos, separa permisos administrativos y médicos, y conserva las correcciones como nuevos registros. La autorización del servidor complementa las políticas RLS de Supabase.","The design accounts for temporary appointment holds and booking conflicts. For clinical data, it separates administrative and medical permissions and preserves corrections as new records. Server-side authorization complements Supabase RLS policies."],
 stack:["Next.js","TypeScript","Prisma","PostgreSQL","Supabase","Scrum / Jira"], status:["En desarrollo · Flujos demostrativos con datos ficticios · Sin puesta en producción","In development · Demonstration workflows with fictional data · Not yet in production"] }
];
export default function ProjectBack({ index }: { index: number }) {
 const {t}=useLocale(); const d=details[index];
 return <div className="project-back-content">
   <span className="case-eyebrow">{t("Detrás del proyecto","Behind the project")}</span>
   <h3>{t(d.title[0],d.title[1])}</h3><p className="case-intro">{t(d.intro[0],d.intro[1])}</p>
   <div className="case-columns"><div><h4>{t("Mi aporte","My contribution")}</h4><p>{t(d.role[0],d.role[1])}</p></div><div><h4>{t("Una decisión técnica","A technical decision")}</h4><p>{t(d.decision[0],d.decision[1])}</p></div></div>
   <ul className="case-stack">{d.stack.map(s=><li key={s}>{s}</li>)}</ul>
   <small>{t(d.status[0],d.status[1])}</small>
 </div>;
}
