export default function formatPriceWithCommas(value) {
  if (typeof value !== "number" && typeof value !== "string") return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}