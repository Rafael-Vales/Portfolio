import AnimalFeedLogo from "./AnimalFeedLogo";
import TripPilotLogo from "./TripPilotLogo";

export default function JourneyProjectLogo({id}: {id: string}) {
  const name = id === "trippilot" ? "TripPilot" : id === "animal-feed" ? "Animal Feed" : null;
  if (!name) return null;
  return <span className="journey-project-logo" role="img" aria-label={name}>
    {id === "trippilot" ? <TripPilotLogo/> : <AnimalFeedLogo/>}
  </span>;
}
