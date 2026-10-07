"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";
const stories = [
 {name:"Mercado Williams", title:["La venta sigue. La conexión puede esperar.","Sales continue. The connection can wait."], text:["Guardar primero en el dispositivo permite seguir trabajando sin internet. La sincronización ocurre al recuperar la conexión.","Saving to the device first allows work to continue offline. Synchronization happens when the connection returns."], steps:[["Sin conexión","Offline"],["Venta guardada localmente","Sale saved locally"],["Conexión recuperada","Connection restored"],["Venta sincronizada","Sale synchronized"]]},
 {name:"TripPilot", title:["De un descubrimiento a un plan.","From a discovery to a plan."],text:["Encontrar un lugar, guardarlo y elegir cuándo visitarlo forman parte de una misma experiencia.","Finding a place, saving it and choosing when to visit are part of one connected experience."],steps:[["Explorar el mapa","Explore the map"],["Guardar un lugar","Save a place"],["Elegir el día","Choose the day"],["Sumar al itinerario","Add to the itinerary"]]},
 {name:"Animal Feed",title:["Cada pedido tiene un recorrido.","Every order has a journey."],text:["El carrito, el checkout y la confirmación necesitan mantenerse conectados. El procesamiento de pagos contempla reintentos y evita cobros duplicados.","Cart, checkout and confirmation need to stay connected. Payment processing handles retries and prevents duplicate charges."],steps:[["Elegir productos","Choose products"],["Revisar el carrito","Review the cart"],["Procesar el pago","Process the payment"],["Confirmar el pedido","Confirm the order"]]},
 {name:"Consultorio",title:["La información correcta, para cada rol.","The right information for each role."],text:["Recepción necesita gestionar turnos; la dermatóloga, acceder a la historia clínica. El diseño separa esos permisos, valida la autorización en el servidor y contempla un registro de los accesos clínicos.","Reception needs to manage appointments; the dermatologist needs access to medical records. The design separates those permissions, validates authorization on the server and accounts for logging clinical access."],steps:[["Iniciar sesión","Sign in"],["Identificar el rol","Identify the role"],["Validar el permiso clínico","Validate clinical permission"],["Registrar el acceso","Log the access"]]}
];
export default function ProductDecisions() {
 const {t}=useLocale(); const [selected,setSelected]=useState(0); const [step,setStep]=useState(-1); const [running,setRunning]=useState(false); const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 function clear(){timers.current.forEach(clearTimeout);timers.current=[];}
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 function play(){clear();setStep(0);setRunning(true);if(matchMedia('(prefers-reduced-motion: reduce)').matches){setStep(3);setRunning(false);return;}
  for(let n=1;n<4;n++)timers.current.push(setTimeout(()=>{setStep(n);if(n===3)setRunning(false);},n*850));
 }
 const story=stories[selected];
 return <section className="product-decisions" id="decisiones" aria-labelledby="decisions-title">
  <div className="decisions-heading"><span>{t("Decisiones de producto","Product decisions")}</span><h2 id="decisions-title">{t("Detrás de cada","Behind every")}<br/><span>{t("producto.","product.")}</span></h2><p>{t("Pequeñas decisiones. Problemas reales. Así conecto la experiencia con lo que la hace funcionar.","Small decisions. Real problems. How I connect the experience with what makes it work.")}</p></div>
  <div className="decision-explorer"><div className="decision-tabs" aria-label={t("Elegir una decisión","Choose a decision")}>{stories.map((s,i)=><button type="button" key={s.name} aria-pressed={selected===i} onClick={()=>{clear();setSelected(i);setStep(-1);setRunning(false);}}>{s.name === "Consultorio" ? t("Consultorio", "Dermatology clinic") : s.name}</button>)}</div>
   <div className="decision-story" key={selected}><h3>{t(story.title[0],story.title[1])}</h3><p>{t(story.text[0],story.text[1])}</p>
   <ol className="decision-flow">{story.steps.map((label,i)=><li key={i} data-reached={i<=step}><span>{i<=step ? "✓" : `0${i+1}`}</span>{t(label[0],label[1])}</li>)}</ol>
   <div className="decision-actions"><button type="button" onClick={play} disabled={running}>{running?t("Mostrando…","Playing…"):step>=0?t("Volver a ver","Play again"):t("Ver cómo funciona","See how it works")} <span aria-hidden="true">↗</span></button><small>{selected === 3 ? t("Diseño en desarrollo · Esquema ilustrativo del acceso clínico.", "Design in development · Illustration of clinical access.") : t("Esquema ilustrativo del funcionamiento.","An illustration of the workflow.")}</small></div>
   <span role="status" className="sr-only">{step>=0?t(story.steps[step][0],story.steps[step][1]):""}</span></div>
  </div>
  <div className="additional-work"><span>{t("También construí","I also built")}</span><a href="#recorrido-dividamos"><strong>Dividamos <span aria-hidden="true">↗</span></strong><p>{t("Gastos compartidos, usuarios reales y menos transferencias.","Shared expenses, real users and fewer transfers.")}</p></a><a href="#recorrido-mercado-williams"><strong>Mercado Williams <span aria-hidden="true">↗</span></strong><p>{t("Un punto de venta para un comercio real, incluso sin internet.","A point of sale for a real business, even offline.")}</p></a></div>
 </section>;
}
