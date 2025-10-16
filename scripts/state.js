import { loadTransactions, saveTransactions, loadSettings, saveSettings } from './storage.js';

const defaultCategories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

const listeners = new Set();

export const state = {
  transactions: [],
  settings: {
    baseCurrency: 'USD',
    currencies: { USD: 1, EUR: 0.92, GBP: 0.79 },
    activeCurrency: 'USD',
    categories: [...defaultCategories],
    budgetCap: 0
  },
  currentFilter: null,
  currentSort: { column: null, direction: 'none' }
};

export function initState() {
  state.transactions = loadTransactions();
  const saved = loadSettings();
  if (saved) state.settings = { ...state.settings, ...saved };
  notify();
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach(fn => fn(state)); }

export function addTransaction(txn) {
  state.transactions.push(txn);
  persist();
}

export function updateTransaction(id, updates) {
  const idx = state.transactions.findIndex(t => t.id === id);
  if (idx !== -1) {
    state.transactions[idx] = { ...state.transactions[idx], ...updates, updatedAt: new Date().toISOString() };
    persist();
  }
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  persist();
}

export function setSort(column) {
  const order = ['none', 'ascending', 'descending'];
  if (state.currentSort.column !== column) {
    state.currentSort = { column, direction: 'ascending' };
  } else {
    const idx = order.indexOf(state.currentSort.direction);
    state.currentSort.direction = order[(idx + 1) % order.length];
  }
  notify();
}

export function getSortedTransactions() {
  const { column, direction } = state.currentSort;
  const arr = [...state.transactions];
  if (!column || direction === 'none') return arr;
  const dir = direction === 'ascending' ? 1 : -1;
  arr.sort((a, b) => {
    if (column === 'amount') return (a.amount - b.amount) * dir;
    if (column === 'date') return (a.date.localeCompare(b.date)) * dir;
    return (String(a[column]).localeCompare(String(b[column]))) * dir;
  });
  return arr;
}

export function setActiveCurrency(code) { state.settings.activeCurrency = code; persistSettings(); }
export function updateCurrencyRates(r) { state.settings.currencies = { ...state.settings.currencies, ...r }; persistSettings(); }
export function setBudgetCap(cap) { state.settings.budgetCap = Number(cap) || 0; persistSettings(); }

function persist() { saveTransactions(state.transactions); notify(); }
function persistSettings() { saveSettings(state.settings); notify(); }

