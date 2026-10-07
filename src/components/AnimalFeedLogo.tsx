import Image from "next/image";

export default function AnimalFeedLogo() {
  return <span className="animal-logo" aria-hidden="true">
    <span className="animal-logo-track" />
    <Image className="animal-logo-dog" src="/images/animal-feed/symbol.svg" width={220} height={280} alt="" />
    <span className="animal-logo-paw"><svg viewBox="0 0 40 40"><ellipse cx="20" cy="26" rx="10" ry="8" /><ellipse cx="8" cy="16" rx="4" ry="5" /><ellipse cx="16" cy="9" rx="4" ry="5" /><ellipse cx="25" cy="9" rx="4" ry="5" /><ellipse cx="33" cy="16" rx="4" ry="5" /></svg></span>
  </span>;
}
