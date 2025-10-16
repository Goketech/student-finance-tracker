import {
  initState,
  state,
  subscribe,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setSort,
  getSortedTransactions,
  setActiveCurrency,
  updateCurrencyRates,
  setBudgetCap,
} from "./state.js";
import {
  renderTransactions,
  renderStats,
  renderForm,
  showError,
  showSuccess,
  showWarning,
  populateCategories,
} from "./ui.js";
import {
  validateDescription,
  validateAmount,
  validateDate,
  validateCategory,
  checkDuplicateWords,
  detectCurrencyPattern,
} from "./validators.js";
import {
  compileRegex,
  searchTransactions,
  toggleCaseSensitive,
} from "./search.js";
import { exportJSON, importJSON, loadTransactions } from "./storage.js";
import { updateRates } from "./currency.js";

const savedTheme = localStorage.getItem("financeTracker:theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("financeTracker:theme", newTheme);
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle)
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${newTheme === "dark" ? "light" : "dark"} mode`
    );
}

function refresh() {
  const txns = getSortedTransactions();
  renderTransactions(txns);
  renderStats();
}

function updateSortIndicators() {
  const { column, direction } = state.currentSort;
  document.querySelectorAll(".th-sort").forEach((btn) => {
    btn.setAttribute("aria-sort", "none");
  });
  if (column && direction !== "none") {
    const activeBtn = document.querySelector(`.th-sort[data-col="${column}"]`);
    if (activeBtn) {
      activeBtn.setAttribute("aria-sort", direction);
    }
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("txn-id").value || null;
  const description = document.getElementById("description").value.trim();
  const amountStr = document.getElementById("amount").value.trim();
  const category = document.getElementById("category").value.trim();
  const date = document.getElementById("date").value;

  const vDesc = validateDescription(description);
  const vAmt = validateAmount(amountStr);
  const vCat = validateCategory(category);
  const vDate = validateDate(date);

  document.getElementById("description-error").textContent = vDesc.valid
    ? ""
    : vDesc.error;
  document.getElementById("amount-error").textContent = vAmt.valid
    ? ""
    : vAmt.error;
  document.getElementById("category-error").textContent = vCat.valid
    ? ""
    : vCat.error;
  document.getElementById("date-error").textContent = vDate.valid
    ? ""
    : vDate.error;

  const warnDup = checkDuplicateWords(description);
  document.getElementById("description-warn").textContent = warnDup
    ? "Warning: duplicate word detected"
    : "";

  if (!vDesc.valid || !vAmt.valid || !vCat.valid || !vDate.valid) {
    showError(
      "Please correct the highlighted fields",
      document.getElementById("transaction-form")
    );
    return;
  }

  const now = new Date().toISOString();
  const payload = {
    id: id || `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    description,
    amount: Number(amountStr),
    category,
    date,
    createdAt: id ? undefined : now,
    updatedAt: now,
  };

  if (id) updateTransaction(id, payload);
  else addTransaction(payload);

  renderForm(null);
  showSuccess("Transaction saved");
}

function wireEvents() {
  document
    .getElementById("theme-toggle")
    ?.addEventListener("click", toggleTheme);

  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  navToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  document
    .getElementById("transaction-form")
    ?.addEventListener("submit", handleSubmit);
  document
    .getElementById("form-reset")
    ?.addEventListener("click", () => renderForm(null));

  document.querySelectorAll(".th-sort").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSort(btn.getAttribute("data-col"));
      updateSortIndicators();
    });
  });

  document
    .getElementById("transactions-tbody")
    ?.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;
      const id = target.getAttribute("data-id");
      const action = target.getAttribute("data-action");
      if (action === "edit") {
        const txn = state.transactions.find((t) => t.id === id);
        if (txn) renderForm(txn);
      } else if (action === "delete") {
        if (confirm("Delete this transaction?")) {
          deleteTransaction(id);
          showSuccess("Transaction deleted");
        }
      }
    });

  document
    .getElementById("transactions-cards")
    ?.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;
      const id = target.getAttribute("data-id");
      const action = target.getAttribute("data-action");
      if (action === "edit") {
        const txn = state.transactions.find((t) => t.id === id);
        if (txn) renderForm(txn);
      } else if (action === "delete") {
        if (confirm("Delete this transaction?")) {
          deleteTransaction(id);
          showSuccess("Transaction deleted");
        }
      }
    });

  const searchInput = document.getElementById("search-input");
  const caseToggle = document.getElementById("case-toggle");
  const clearBtn = document.getElementById("search-clear");
  function applySearch() {
    const regex = compileRegex(searchInput.value || "", "");
    const filtered = regex
      ? searchTransactions(getSortedTransactions(), regex)
      : getSortedTransactions();
    renderTransactions(filtered);
  }
  searchInput?.addEventListener("input", applySearch);
  caseToggle?.addEventListener("change", (e) => {
    toggleCaseSensitive(e.target.checked);
    applySearch();
  });
  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    applySearch();
  });

  document
    .getElementById("export-json")
    ?.addEventListener("click", () => exportJSON());
  document
    .getElementById("import-json")
    ?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await importJSON(file);

        state.transactions = loadTransactions();

        refresh();

        const newCount = result.imported.length;
        const dupCount = result.duplicates.length;

        if (newCount > 0 && dupCount > 0) {
          showSuccess(
            `✅ Imported ${newCount} new transaction(s). Total: ${result.total}`
          );
          setTimeout(() => {
            showWarning(`⚠️ ${dupCount} duplicate(s) skipped (already exist)`);
          }, 500);
        } else if (newCount > 0) {
          showSuccess(
            `✅ Imported ${newCount} new transaction(s). Total: ${result.total}`
          );
        } else if (dupCount > 0) {
          showWarning(
            `⚠️ No new transactions imported. All ${dupCount} transaction(s) already exist.`
          );
        }

        e.target.value = "";
      } catch (err) {
        console.error("Import error:", err);
        showError("❌ Failed to import: " + err.message);
        e.target.value = "";
      }
    });

  document
    .getElementById("export-csv")
    ?.addEventListener("click", () => exportCSV(state.transactions));
  document.getElementById("clear-data")?.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to clear all transactions? This cannot be undone."
      )
    ) {
      state.transactions = [];
      localStorage.removeItem("financeTracker:transactions");
      refresh();
      showSuccess("All data cleared");
    }
  });

  document
    .getElementById("active-currency")
    ?.addEventListener("change", (e) => {
      setActiveCurrency(e.target.value);
      updateRates(state.settings.currencies);
    });

  document.getElementById("update-rates")?.addEventListener("click", () => {
    const r = {
      USD: Number(document.getElementById("rate-usd").value || 1),
      EUR: Number(document.getElementById("rate-eur").value || 0.92),
      GBP: Number(document.getElementById("rate-gbp").value || 0.79),
    };
    updateCurrencyRates(r);
    updateRates(r);
    showSuccess("Rates updated and applied");
  });

  document.getElementById("budget-cap-save")?.addEventListener("click", () => {
    const cap = Number(document.getElementById("budget-cap-input").value || 0);
    setBudgetCap(cap);
    showSuccess("Budget cap set");
  });
}

function initUIFromState() {
  const select = document.getElementById("active-currency");
  select.innerHTML = "";
  Object.keys(state.settings.currencies).forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = code;
    if (code === state.settings.activeCurrency) opt.selected = true;
    select.appendChild(opt);
  });
  populateCategories(state.settings.categories);

  document.getElementById("rate-usd").value =
    state.settings.currencies.USD || 1;
  document.getElementById("rate-eur").value =
    state.settings.currencies.EUR || 0.92;
  document.getElementById("rate-gbp").value =
    state.settings.currencies.GBP || 0.79;

  updateRates(state.settings.currencies);

  if (state.settings.budgetCap) {
    document.getElementById("budget-cap-input").value =
      state.settings.budgetCap;
  }
}

export function announceToScreenReader(message, priority = "polite") {
  const liveRegion = document.getElementById(`live-region-${priority}`);
  liveRegion.textContent = "";
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

function suggestAmountFromDescription() {
  const descEl = document.getElementById("description");
  const amtEl = document.getElementById("amount");
  descEl?.addEventListener("input", () => {
    const found = detectCurrencyPattern(descEl.value);
    if (found && !amtEl.value) {
      const normalized = found.replace(",", ".");
      if (/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(normalized))
        amtEl.value = normalized;
    }
  });
}

function exportCSV(transactions) {
  const headers = ["ID", "Description", "Amount", "Category", "Date"];
  const escapeCSV = (value) => {
    if (
      typeof value === "string" &&
      (value.includes(",") || value.includes('"') || value.includes("\n"))
    ) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  };
  const rows = transactions.map((t) =>
    [t.id, escapeCSV(t.description), t.amount, t.category, t.date].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker
        .register("./sw.js")
        .catch((error) =>
          console.warn("Service worker registration failed:", error)
        );
    } catch {
      /* noop */
    }
  }
}

subscribe(() => {
  refresh();
});

window.addEventListener("DOMContentLoaded", () => {
  initState();
  initUIFromState();
  wireEvents();
  suggestAmountFromDescription();
  refresh();
  updateSortIndicators();
  registerServiceWorker();

  if (location.protocol === "file:") {
    const mw = document.getElementById("module-warning");
    if (mw) {
      mw.classList.remove("sr-only");
      mw.textContent =
        "Tip: ES modules may not run from file://. Use a local server (e.g., `npx serve`).";
    }
  }
});
