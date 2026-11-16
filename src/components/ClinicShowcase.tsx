"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "./LocaleProvider";

const screens = [
  {
    file: "agenda",
    width: 1440,
    height: 960,
    label: ["Agenda", "Schedule"],
    alt: ["Agenda semanal con turnos por tipo, espacios libres y horarios bloqueados", "Weekly schedule with appointments by type, open slots, and blocked hours"],
    caption: ["Recepción ve la disponibilidad, filtra turnos y puede bloquear horarios o reprogramar.", "Reception can see availability, filter appointments, block time, and reschedule."],
  },
  {
    file: "reserva-movil",
    width: 393,
    height: 852,
    label: ["Reserva móvil", "Mobile booking"],
    alt: ["Selección de horario para una consulta desde el celular", "Selecting a consultation time on a phone"],
    caption: ["La paciente elige un horario disponible, revisa su cobertura e informa el pago de la seña.", "Patients choose an available time, review their coverage, and submit proof of their deposit."],
  },
  {
    file: "pagos",
    width: 1440,
    height: 960,
    label: ["Pagos", "Payments"],
    alt: ["Bandeja de señas con un comprobante de ejemplo y el saldo del turno", "Deposit review queue showing a sample receipt and the appointment balance"],
    caption: ["Recepción puede revisar varios comprobantes de un turno y gestionar los pagos que requieren una decisión.", "Reception can review multiple receipts for one appointment and handle payments requiring a decision."],
  },
] as const;

export default function ClinicShowcase() {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const screen = screens[active];
  const src = `/images/consultorio/${screen.file}.webp`;

  return (
    <div className="clinic-project-content">
      <div className="clinic-project-copy">
        <span className="clinic-project-status">{t("Tesis en desarrollo", "Thesis in development")}</span>
        <h3>{t("Consultorio dermatológico")}</h3>
        <p>{t(
          "Del turno por WhatsApp a un sistema que conecta la reserva, la gestión de señas y el seguimiento clínico.",
          "From WhatsApp bookings to a system that connects scheduling, deposit management, and clinical follow-up.",
        )}</p>
        <small className="clinic-project-note">{t("Tech Lead · Equipo de cuatro personas", "Tech Lead · Four-person team")}</small>
      </div>
      <div className="clinic-screens">
        <div className="clinic-screen-controls" role="group" aria-label={t("Elegir pantalla del Consultorio", "Choose a clinic screen")}>
          {screens.map((item, index) => (
            <button key={item.file} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
              {t(item.label[0], item.label[1])}
            </button>
          ))}
        </div>
        <figure className="clinic-screen">
          <a className="clinic-screen-preview" href={src} target="_blank" rel="noopener noreferrer"
            aria-label={t(`Ampliar ${screen.label[0]} (abre en otra pestaña)`, `Enlarge ${screen.label[1]} (opens in a new tab)`)}>
            <Image src={src} width={screen.width} height={screen.height} alt={t(screen.alt[0], screen.alt[1])}
              sizes={screen.file === "reserva-movil" ? "180px" : "(max-width: 850px) 90vw, 540px"} />
          </a>
          <figcaption aria-live="polite">{t(screen.caption[0], screen.caption[1])}</figcaption>
        </figure>
        <small>{t("Maquetas de Figma · Datos de demostración", "Figma mockups · Demo data")}</small>
      </div>
    </div>
  );
}
