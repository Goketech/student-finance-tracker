export function calculateTotal(transactions) {
  return transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

export function calculateLast7Days(transactions) {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, total: 0 };
  });
  const map = new Map(days.map(d => [d.date, d]));
  for (const t of transactions) {
    if (map.has(t.date)) map.get(t.date).total += Number(t.amount || 0);
  }
  return days;
}

export function getTopCategory(transactions) {
  const counts = new Map();
  transactions.forEach(t => counts.set(t.category, (counts.get(t.category) || 0) + 1));
  let top = null; let max = 0; let total = transactions.length || 1;
  for (const [cat, cnt] of counts.entries()) {
    if (cnt > max) { max = cnt; top = cat; }
  }
  const pct = max ? Math.round((max / total) * 100) : 0;
  return { category: top, percentage: pct };
}

export function checkBudgetCap(totalSpent, cap) {
  if (!cap || cap <= 0) return { status: 'none', percent: 0 };
  const percent = Math.min(100, Math.round((totalSpent / cap) * 100));
  let status = 'under';
  if (percent >= 100) status = 'over';
  else if (percent >= 80) status = 'near';
  return { status, percent };
}

export function generateSimpleChart(container, data) {
  if (!container) return;
  container.innerHTML = '';
  const max = Math.max(1, ...data.map(d => d.total));
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gridTemplateColumns = 'repeat(7, 1fr)';
  wrap.style.gap = '6px';
  data.forEach(d => {
    const barWrap = document.createElement('div');
    barWrap.style.display = 'flex';
    barWrap.style.flexDirection = 'column';
    barWrap.style.alignItems = 'center';
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${Math.round((d.total / max) * 80) + 10}px`;
    bar.style.width = '100%';
    bar.style.background = 'var(--color-primary)';
    bar.style.borderRadius = '4px';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `${d.date}: ${d.total}`);
    const label = document.createElement('span');
    label.style.fontSize = '10px';
    label.style.color = 'var(--color-text-muted)';
    label.textContent = d.date.slice(5);
    barWrap.appendChild(bar);
    barWrap.appendChild(label);
    wrap.appendChild(barWrap);
  });
  container.appendChild(wrap);
}

