const STORAGE_KEY_TXNS = "financeTracker:transactions";
const STORAGE_KEY_SETTINGS = "financeTracker:settings";

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXNS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    console.warn("Failed to load transactions:", e);
    return [];
  }
}

export function saveTransactions(data) {
  try {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(data || []));
  } catch (e) {
    throw new Error("Failed to save transactions");
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    throw new Error("Failed to save settings");
  }
}

export function exportJSON() {
  const txns = loadTransactions();
  const blob = new Blob([JSON.stringify(txns, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!validateImportData(data)) {
      throw new Error(
        "Invalid JSON structure. Expected an array of transaction objects."
      );
    }

    const existing = loadTransactions();
    const existingIds = new Set(existing.map((t) => t.id));

    const duplicates = [];
    const newTransactions = [];

    data.forEach((txn) => {
      if (existingIds.has(txn.id)) {
        duplicates.push(txn);
      } else {
        newTransactions.push(txn);
      }
    });

    const merged = [...existing, ...newTransactions];
    saveTransactions(merged);

    return {
      imported: newTransactions,
      duplicates: duplicates,
      total: merged.length,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON file. Please check the file format.");
    }
    throw error;
  }
}

export function validateImportData(data) {
  if (!Array.isArray(data)) return false;
  return data.every(
    (t) =>
      t &&
      typeof t.id === "string" &&
      typeof t.description === "string" &&
      typeof t.amount === "number" &&
      Number.isFinite(t.amount) &&
      typeof t.category === "string" &&
      typeof t.date === "string" &&
      /\d{4}-\d{2}-\d{2}/.test(t.date)
  );
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY_TXNS);
}
