import primary from "../../assets/brand/logos/mzaya-mark-green.svg";
import white from "../../assets/brand/logos/mzaya-mark-white.svg";
import navy from "../../assets/brand/logos/mzaya-mark-navy.svg";

const sources = { primary, white, navy };

export default function MzayaIcon({
  variant = "primary",
  className = "",
  title = "Mzaya",
}) {
  return <img src={sources[variant] ?? primary} alt={title} className={className} />;
}
