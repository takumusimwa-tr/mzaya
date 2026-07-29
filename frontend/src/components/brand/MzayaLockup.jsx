import primary from "../../assets/brand/logos/mzaya-lockup-horizontal-primary.svg";
import white from "../../assets/brand/logos/mzaya-lockup-horizontal-white.svg";
import navy from "../../assets/brand/logos/mzaya-lockup-horizontal-navy.svg";

const sources = { primary, white, navy };

export default function MzayaLockup({
  variant = "primary",
  className = "",
  title = "Mzaya — Tumai Mzaya",
}) {
  return <img src={sources[variant] ?? primary} alt={title} className={className} />;
}
