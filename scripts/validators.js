export function validateDescription(value) {
  const pattern = /^\S(?:.*\S)?$/;
  if (!value || !pattern.test(value)) {
    return {
      valid: false,
      error: "Description cannot start or end with spaces",
    };
  }
  return { valid: true, error: "" };
}

export function validateAmount(value) {
  const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  if (!value || !pattern.test(String(value))) {
    return { valid: false, error: "Enter valid amount (e.g., 12.50)" };
  }
  return { valid: true, error: "" };
}

export function validateDate(value) {
  const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!value || !pattern.test(value)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format" };
  }
  return { valid: true, error: "" };
}

export function validateCategory(value) {
  const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  if (!value || !pattern.test(value)) {
    return {
      valid: false,
      error: "Category can only contain letters, spaces, and hyphens",
    };
  }
  return { valid: true, error: "" };
}

export function checkDuplicateWords(text) {
  const pattern = /\b(\w+)\s+\1\b/i;
  return pattern.test(text || "");
}

export function detectCurrencyPattern(text) {
  const pattern = /(?=.*\d)(?=.*[.,]\d{2})\d+[.,]\d{2}/;
  const match = (text || "").match(pattern);
  return match ? match[0] : null;
}
