import { state, getSortedTransactions } from "./state.js";
import { formatCurrency, convertAmount } from "./currency.js";
import {
  calculateTotal,
  calculateLast7Days,
  getTopCategory,
  checkBudgetCap,
  generateSimpleChart,
} from "./stats.js";

export function renderTransactions(transactions) {
  const tbody = document.getElementById("transactions-tbody");
  tbody.innerHTML = "";
  transactions.forEach((t) => {
    const tr = document.createElement("tr");
    tr.className = "transaction-row";
    const convertedAmount = convertAmount(
      Number(t.amount),
      state.settings.baseCurrency,
      state.settings.activeCurrency
    );
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${escapeHtml(t.description)}</td>
      <td>${formatCurrency(convertedAmount, state.settings.activeCurrency)}</td>
      <td>${escapeHtml(t.category)}</td>
      <td>
        <button class="button-secondary" data-action="edit" data-id="${
          t.id
        }">Edit</button>
        <button class="button-danger" data-action="delete" data-id="${
          t.id
        }">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });

  const cards = document.getElementById("transactions-cards");
  cards.innerHTML = "";
  cards.removeAttribute("hidden");
  transactions.forEach((t) => {
    const card = document.createElement("div");
    card.className = "card transaction-row";
    const convertedAmount = convertAmount(
      Number(t.amount),
      state.settings.baseCurrency,
      state.settings.activeCurrency
    );
    card.innerHTML = `
      <div><strong>${t.date}</strong></div>
      <div>${escapeHtml(t.description)}</div>
      <div>${formatCurrency(
        convertedAmount,
        state.settings.activeCurrency
      )}</div>
      <div>${escapeHtml(t.category)}</div>
      <div class="inline">
        <button class="button-secondary" data-action="edit" data-id="${
          t.id
        }">Edit</button>
        <button class="button-danger" data-action="delete" data-id="${
          t.id
        }">Delete</button>
      </div>`;
    cards.appendChild(card);
  });
}

export function renderStats() {
  const txns = getSortedTransactions();

  const countEl = document.getElementById("stat-total-count");
  if (countEl) {
    const valueEl = countEl.querySelector(".stat-value");
    if (valueEl) valueEl.textContent = String(txns.length);
  }

  const total = calculateTotal(txns);
  const convertedTotal = convertAmount(
    total,
    state.settings.baseCurrency,
    state.settings.activeCurrency
  );
  const spentEl = document.getElementById("stat-total-spent");
  if (spentEl) {
    const valueEl = spentEl.querySelector(".stat-value");
    if (valueEl)
      valueEl.textContent = formatCurrency(
        convertedTotal,
        state.settings.activeCurrency
      );
  }

  const top = getTopCategory(txns);
  const topEl = document.getElementById("stat-top-category");
  if (topEl) {
    const valueEl = topEl.querySelector(".stat-value");
    if (valueEl)
      valueEl.textContent = top.category
        ? `${top.category} (${top.percentage}%)`
        : "—";
  }

  const data7 = calculateLast7Days(txns);
  const chartEl = document.querySelector("#stat-7day .chart");
  generateSimpleChart(chartEl, data7);

  const budgetInput = document.getElementById("budget-cap-input");
  if (budgetInput && state.settings.budgetCap) {
    budgetInput.value = state.settings.budgetCap;
  }

  const capInfo = checkBudgetCap(convertedTotal, state.settings.budgetCap);
  const bar = document.getElementById("budget-progress");
  if (bar) {
    bar.style.width = `${capInfo.percent}%`;
    bar.setAttribute("aria-valuenow", String(capInfo.percent));
    bar.style.background =
      capInfo.status === "over"
        ? "var(--color-error)"
        : capInfo.status === "near"
        ? "var(--color-warning)"
        : "var(--color-success)";
  }

  if (capInfo.status !== "none") {
    updateLiveRegion(
      capInfo.status === "over"
        ? "Budget cap exceeded"
        : capInfo.status === "near"
        ? "Approaching budget cap"
        : "Under budget",
      capInfo.status === "over" ? "assertive" : "polite"
    );
  }
}

export function renderForm(transaction) {
  document.getElementById("txn-id").value = transaction?.id || "";
  document.getElementById("description").value = transaction?.description || "";
  document.getElementById("amount").value =
    transaction?.amount != null ? String(transaction.amount) : "";
  document.getElementById("category").value = transaction?.category || "";
  document.getElementById("date").value = transaction?.date || "";
}

export function showError(message, element) {
  if (element) {
    element.classList.add("shake");
    setTimeout(() => element.classList.remove("shake"), 600);
  }
  updateLiveRegion(message || "Error", "assertive");
  showToast(message || "Error", "error");
}

export function showSuccess(message) {
  updateLiveRegion(message || "Success", "polite");
  showToast(message || "Success", "success");
}

export function showWarning(message) {
  updateLiveRegion(message || "Warning", "polite");
  showToast(message || "Warning", "warning");
}

function showToast(message, type = "info") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");

  const colors = {
    success: {
      background: "#00AA00",
      color: "#ffffff",
      shadow: "0 4px 12px rgba(0, 170, 0, 0.3)",
    },
    error: {
      background: "#CC0000",
      color: "#ffffff",
      shadow: "0 4px 12px rgba(204, 0, 0, 0.3)",
    },
    warning: {
      background: "#FF9900",
      color: "#ffffff",
      shadow: "0 4px 12px rgba(255, 153, 0, 0.3)",
    },
    info: {
      background: "#0066CC",
      color: "#ffffff",
      shadow: "0 4px 12px rgba(0, 102, 204, 0.3)",
    },
  };

  const colorScheme = colors[type] || colors.info;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.zIndex = "99999";
  toast.style.maxWidth = "400px";
  toast.style.padding = "16px 24px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "14px";
  toast.style.fontWeight = "500";
  toast.style.background = colorScheme.background;
  toast.style.color = colorScheme.color;
  toast.style.boxShadow = colorScheme.shadow;
  toast.style.border = "none";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

export function updateLiveRegion(message, priority = "polite") {
  const el = document.getElementById(`live-region-${priority}`);
  if (!el) return;
  el.textContent = "";
  setTimeout(() => {
    el.textContent = message;
  }, 100);
}

export function populateCategories(categories) {
  const dl = document.getElementById("category-list");
  dl.innerHTML = "";
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    dl.appendChild(opt);
  });
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"]+/g,
    (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[s])
  );
}
