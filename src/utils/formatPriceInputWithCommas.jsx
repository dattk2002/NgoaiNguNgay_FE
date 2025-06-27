export default function formatPriceInputWithCommas(value) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  // Remove all non-digit characters
  const numericString = value.toString().replace(/[^\d]/g, "");
  if (!numericString) return "";
  // Format with commas
  return numericString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
