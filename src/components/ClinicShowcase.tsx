"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "./LocaleProvider";

type Translation = readonly [string, string];
type Capture = { file: string; width: number; height: number; alt: Translation };

type Screen = Capture & { label: Translation; caption: Translation };

const clinicScreens: Screen[] = [
  { file: "inicio", width: 1440, height: 960, label: ["Inicio", "Dashboard"],
    alt: ["Inicio de dermatología con jornada, pacientes en espera y próximos turnos.", "Dermatology dashboard with the day's schedule, waiting patients, and upcoming appointments."],
    caption: ["La dermatóloga ve qué consulta está en curso y quién sigue.", "The dermatologist can see the current consultation and who is next."] },
  { file: "agenda-escritorio", width: 1440, height: 960, label: ["Agenda", "Schedule"],
    alt: ["Agenda semanal con turnos, disponibilidad y filtros.", "Weekly schedule with appointments, availability, and filters."],
    caption: ["Recepción organiza la semana y consulta la disponibilidad por tipo de turno.", "Reception organizes the week and checks availability by appointment type."] },
  { file: "pagos-comprobante", width: 1440, height: 960, label: ["Pagos", "Payments"],
    alt: ["Bandeja de pagos con detalle de la seña y acciones para aceptar o rechazar.", "Payment queue with deposit details and actions to accept or reject it."],
    caption: ["Recepción revisa los comprobantes y valida la seña desde la bandeja de pagos.", "Reception reviews receipts and validates the deposit from the payment queue."] },
  { file: "estadisticas", width: 1440, height: 1716, label: ["Estadísticas", "Statistics"],
    alt: ["Panel con ausencias, espera, seguimiento y duración de turnos.", "Dashboard with absences, waiting times, follow-up, and appointment duration."],
    caption: ["El equipo puede revisar indicadores de la operación y el seguimiento de pacientes.", "The team can review operational and patient follow-up metrics."] },
  { file: "atencion", width: 1440, height: 1180, label: ["Atención", "Clinical care"],
    alt: ["Formulario de evolución con antecedentes, indicaciones, prácticas y fotos.", "Progress note form with history, care instructions, procedures, and photos."],
    caption: ["Durante la consulta, la dermatóloga registra lo que hizo y revisa el contexto clínico.", "During the visit, the dermatologist documents care and reviews the clinical context."] },
  { file: "ficha", width: 1440, height: 960, label: ["Ficha", "Patient record"],
    alt: ["Resumen de la ficha con antecedentes, última evolución y datos del próximo turno.", "Patient record summary with history, the latest note, and upcoming appointment details."],
    caption: ["La ficha reúne la historia clínica y el seguimiento de cada paciente.", "The record brings together each patient's medical history and follow-up."] },
];

const bookingSteps: Screen[] = [
  { file: "elegir-dia", width: 393, height: 852, label: ["Día", "Day"], alt: ["Calendario de días disponibles.", "Calendar of available days."], caption: ["La paciente elige un día disponible.", "The patient chooses an available day."] },
  { file: "elegir-hora", width: 393, height: 852, label: ["Horario", "Time"], alt: ["Selección del horario del turno.", "Choosing an appointment time."], caption: ["Elige uno de los horarios libres.", "She picks an available time."] },
  { file: "revision", width: 393, height: 852, label: ["Revisión", "Review"], alt: ["Revisión de los datos antes de reservar.", "Reviewing the details before booking."], caption: ["Revisa el turno y la seña antes de reservar.", "She reviews the appointment and deposit before booking."] },
  { file: "mis-turnos", width: 393, height: 852, label: ["Mis turnos", "My appointments"], alt: ["Mis turnos muestra la seña en revisión.", "My appointments shows the deposit under review."], caption: ["Consulta el estado de la seña desde Mis turnos.", "She checks the deposit status in My appointments."] },
];

const bookingOverview: Capture = {
  file: "secuencia-movil", width: 1280, height: 680,
  alt: ["Cuatro pantallas: elegir día, elegir horario, revisar la reserva y consultar Mis turnos.", "Four screens: choose a day, choose a time, review the booking, and check My appointments."],
};

const qrSteps: Screen[] = [
  { file: "qr-computadora", width: 1060, height: 713, label: ["Abrir el QR", "Open the QR code"],
    alt: ["Diálogo de computadora con código QR y panel de fotos recibidas.", "Desktop dialog with a QR code and a panel for received photos."],
    caption: ["Computadora · La dermatóloga abre el QR durante la consulta. El mismo diálogo le permite revisar y etiquetar las fotos cuando llegan.", "Desktop · The dermatologist opens the QR code during the visit. The same dialog lets her review and tag photos as they arrive."] },
  { file: "qr-elegir", width: 393, height: 852, label: ["Elegir y enviar", "Choose and send"],
    alt: ["Celular con dos imágenes seleccionadas y el botón para enviarlas.", "Phone with two selected images and the send button."],
    caption: ["Celular · Al escanear el QR, puede elegir fotos de la galería y enviarlas a la computadora.", "Phone · After scanning the QR code, she can select photos from the gallery and send them to the computer."] },
  { file: "qr-enviadas", width: 393, height: 852, label: ["Confirmar recepción", "Confirm receipt"],
    alt: ["Celular con el aviso verde de fotos recibidas.", "Phone with a green confirmation that the photos arrived."],
    caption: ["Celular · El aviso confirma que llegaron. La revisión y el guardado se hacen en la computadora.", "Phone · A message confirms delivery. Review and saving happen on the computer."] },
  { file: "qr-ficha", width: 1440, height: 960, label: ["Consultar la ficha", "View the patient record"],
    alt: ["Galería de fotos guardadas en la ficha de otra paciente de ejemplo.", "Saved photo gallery in a different sample patient’s record."],
    caption: ["Computadora · Una vez revisadas y guardadas, las fotos se consultan en la ficha. Esta captura muestra otro caso de ejemplo.", "Desktop · Once reviewed and saved, photos are available in the patient record. This screen shows a different sample case."] },
];

const groups = [
  { label: ["Consultorio", "Clinic"], screens: clinicScreens },
  { label: ["Reserva móvil", "Mobile booking"], screens: bookingSteps },
  { label: ["Fotos por QR", "QR photo upload"], screens: qrSteps },
] as const;

function capturePath(capture: Capture) {
  return `/images/consultorio/caso-${capture.file}.webp`;
}

function ClinicCapture({ capture, onOpen, className = "" }: {
  capture: Capture; onOpen: () => void; className?: string;
}) {
  const { t } = useLocale();
  return (
    <button type="button" className={`clinic-screen-preview ${className}`} onClick={onOpen} aria-haspopup="dialog"
      aria-label={t(`Ampliar imagen. ${capture.alt[0]}`, `Enlarge image. ${capture.alt[1]}`)}>
      <Image src={capturePath(capture)} width={capture.width} height={capture.height} alt={t(...capture.alt)}
        sizes="(max-width: 700px) 90vw, (max-width: 1240px) 62vw, 780px" />
      <span className="clinic-preview-action" aria-hidden="true">{t("Ampliar", "Enlarge")} ↗</span>
    </button>
  );
}

function ClinicImageViewer({ screens, initialIndex, onClose }: {
  screens: Screen[]; initialIndex: number; onClose: () => void;
}) {
  const { t } = useLocale();
  const [index, setIndex] = useState(initialIndex);
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const capture = screens[index];
  const openDialog = useCallback((element: HTMLDialogElement | null) => {
    dialog.current = element;
    if (element && !element.open) {
      element.showModal();
      element.querySelector<HTMLButtonElement>("[data-viewer-close]")?.focus();
    }
  }, []);

  function move(direction: number) {
    setIndex(current => (current + direction + screens.length) % screens.length);
  }

  function handleKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") event.stopPropagation();
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.stopPropagation();
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  return createPortal(
    <dialog className="clinic-image-viewer" aria-labelledby={titleId} ref={openDialog} onClose={onClose} onKeyDown={handleKeys} onClick={event => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    }}>
      <div className="clinic-viewer-panel">
        <header className="clinic-viewer-header">
          <div className="clinic-viewer-title" aria-live="polite">
            <h2 id={titleId}>{t(...capture.label)}</h2>
            <span>{index + 1} / {screens.length}</span>
          </div>
          <div className="clinic-viewer-controls">
            <button type="button" onClick={() => move(-1)} aria-label={t("Imagen anterior", "Previous image")}>←</button>
            <button type="button" onClick={() => move(1)} aria-label={t("Imagen siguiente", "Next image")}>→</button>
            <button type="button" data-viewer-close onClick={() => dialog.current?.close()} aria-label={t("Cerrar visor", "Close viewer")}>×</button>
          </div>
        </header>
        <div className="clinic-viewer-image">
          <Image key={capture.file} src={capturePath(capture)} width={capture.width} height={capture.height}
            alt={t(...capture.alt)} unoptimized />
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

export default function ClinicShowcase() {
  const { t } = useLocale();
  const [group, setGroup] = useState(0);
  const [step, setStep] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const selection = groups[group];
  const screen = selection.screens[step];
  const numbered = group !== 0;

  return (
    <div className="clinic-project-content">
      <div className="clinic-project-copy">
        <span className="clinic-project-status">{t("Tesis · Equipo de 4 · En desarrollo", "Thesis · Team of 4 · In development")}</span>
        <h3>{t("Consultorio dermatológico")}</h3>
        <p>{t("Sistema web para un consultorio real. Une la reserva de turnos desde el celular con la agenda, la validación de señas y la atención clínica.",
          "A web system for a real clinic. It connects mobile booking with the schedule, deposit review, and clinical care.")}</p>
        <div className="clinic-screen-context" aria-live="polite">
          {group === 1 && <p className="clinic-capture-wide">{t("Elegir día → Elegir horario → Revisar la reserva → Mis turnos.", "Choose a day → Choose a time → Review the booking → My appointments.")}</p>}
          <p className={group === 1 ? "clinic-booking-mobile" : undefined}>{t(...screen.caption)}</p>
          <small>{t("Diseños de Figma · Datos de ejemplo", "Figma designs · Sample data")}</small>
        </div>
      </div>
      <div className="clinic-screens">
        <div className="clinic-screen-controls clinic-gallery-groups" role="group" aria-label={t("Elegir recorrido", "Choose a workflow")}>
          {groups.map((item, index) => (
            <button key={item.label[0]} type="button" aria-pressed={group === index} onClick={() => { setGroup(index); setStep(0); }}>
              {t(item.label[0], item.label[1])}
            </button>
          ))}
        </div>
        {group === 1 && (
          <figure className="clinic-screen clinic-capture-wide">
            <ClinicCapture capture={bookingOverview} onOpen={() => setViewerIndex(0)} />
          </figure>
        )}
        <div className={group === 1 ? "clinic-booking-mobile" : undefined}>
          <div className="clinic-screen-controls clinic-gallery-steps" role="group" aria-label={t("Elegir pantalla", "Choose a screen")}>
            {selection.screens.map((item, index) => (
              <button key={item.file} type="button" aria-pressed={step === index} onClick={() => setStep(index)}>
                {numbered && <span className="clinic-step-number">{index + 1}.</span>} {t(...item.label)}
              </button>
            ))}
          </div>
          <figure className="clinic-screen">
            <ClinicCapture capture={screen} onOpen={() => setViewerIndex(step)} className={screen.width < 500 ? "clinic-screen-phone" : ""} />
          </figure>
        </div>
      </div>
      {viewerIndex !== null && <ClinicImageViewer screens={selection.screens} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
    </div>
  );
}
