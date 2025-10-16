import { showError } from "./ui.js";

let caseSensitive = false;

export function compileRegex(pattern, flags = "") {
  if (!pattern) return null;
  const finalFlags = caseSensitive
    ? flags.replace("i", "")
    : flags.includes("i")
    ? flags
    : flags + "i";
  try {
    return new RegExp(pattern, finalFlags);
  } catch (e) {
    console.error("Invalid regex:", e);
    showError("Invalid search pattern");
    return null;
  }
}

export function searchTransactions(transactions, regex) {
  if (!regex) return transactions;
  return transactions.filter(
    (t) =>
      regex.test(t.description) ||
      regex.test(t.category) ||
      regex.test(String(t.amount)) ||
      regex.test(t.date)
  );
}

export function highlightMatches(text, regex) {
  if (!regex) return text;
  try {
    return text.replace(regex, (m) => `<mark>${m}</mark>`);
  } catch {
    return text;
  }
}

export function toggleCaseSensitive(on) {
  caseSensitive = Boolean(on);
}
