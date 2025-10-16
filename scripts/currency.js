let rates = { USD: 1, EUR: 0.92, GBP: 0.79 };

export function updateRates(newRates) {
  rates = { ...rates, ...newRates };
}

export function convertAmount(amount, fromCurrency, toCurrency) {
  const from = rates[fromCurrency] ?? 1;
  const to = rates[toCurrency] ?? 1;
  return (amount / from) * to;
}

export function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function getRates() { return { ...rates }; }

