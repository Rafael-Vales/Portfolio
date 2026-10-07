import { useId } from "react";
export default function TripPilotLogo() {
 const id=useId();
  return <svg className="trip-card-logo" viewBox="0 0 1024 1024" aria-hidden="true">
    <defs>
      <mask id={`${id}-orbit`}>
        <rect width="1024" height="1024" fill="white" />
        <path d="M166 596 C62 824 234 868 545 666 C720 551 821 407 804 316" fill="none" stroke="black" strokeWidth="64" />
      </mask>
      <mask id={`${id}-plane`} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
        <rect width="1024" height="1024" fill="white" />
        <circle className="trip-logo-occlusion" cx="498" cy="526" r="295" fill="black" />
      </mask>
    </defs>
    <rect width="1024" height="1024" fill="#02302b" />
    <g mask={`url(#${id}-orbit)`} fill="none" stroke="white" strokeWidth="31">
      <circle cx="498" cy="526" r="279" />
      <ellipse cx="498" cy="526" rx="126" ry="279" />
      <path d="M498 247V805 M220 523H776 M283 347Q498 453 713 347 M279 704Q498 597 717 704" />
    </g>
    <path d="M611 239Q686 216 730 230L685 250Q667 251 659 260Z" fill="#148779" />
    <path d="M187 557 C64 793 184 856 466 714 C670 611 794 466 812 388L794 331 C789 460 644 604 452 705 C234 820 135 792 187 557Z" fill="#148779" />
    <g mask={`url(#${id}-plane)`}>
    <g className="trip-logo-plane-orbit">
      <g transform="rotate(45) translate(-785 -290)">
      <path d="M717 231 L815 259 L850 222 Q869 204 880 214 Q890 225 872 245 L836 283 L851 367 L830 390 L795 310 L764 337 L764 365 L749 381 L731 343 L696 326 L711 309 L740 311 L769 278 L695 247Z" fill="white" stroke="#02302b" strokeWidth="14" strokeLinejoin="round" />
      </g>
    </g>
    </g>
  </svg>;
}
