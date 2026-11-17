// Vercel Serverless Function: POST /api/split
// Input:  { "expenses": [ { "payer": "Amit", "amount": 600, "participants": ["Amit","Riya","Sam"] } ] }
// Output: per-person balances + the minimum list of payments to settle everyone up.

function settle(expenses) {
  const balance = {};
  for (const e of expenses) {
    const amount = Number(e.amount);
    const people = (e.participants && e.participants.length) ? e.participants : [e.payer];
    if (!e.payer || !(amount > 0)) continue;
    const share = amount / people.length;
    balance[e.payer] = (balance[e.payer] || 0) + amount;
    for (const p of people) balance[p] = (balance[p] || 0) - share;
  }

  const round = (n) => Math.round(n * 100) / 100;
  const creditors = [], debtors = [];
  for (const [name, bal] of Object.entries(balance)) {
    const b = round(bal);
    if (b > 0) creditors.push({ name, amt: b });
    else if (b < 0) debtors.push({ name, amt: -b });
  }
  creditors.sort((a, b) => b.amt - a.amt);
  debtors.sort((a, b) => b.amt - a.amt);

  // Greedy: largest debtor pays largest creditor -> minimal number of transfers in practice
  const payments = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = round(Math.min(debtors[i].amt, creditors[j].amt));
    if (pay > 0) payments.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].amt = round(debtors[i].amt - pay);
    creditors[j].amt = round(creditors[j].amt - pay);
    if (debtors[i].amt <= 0.009) i++;
    if (creditors[j].amt <= 0.009) j++;
  }

  const balances = Object.fromEntries(Object.entries(balance).map(([k, v]) => [k, round(v)]));
  const total = round(expenses.reduce((s, e) => s + (Number(e.amount) > 0 ? Number(e.amount) : 0), 0));
  return { total, balances, payments };
}

module.exports = (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', usage: 'POST { expenses: [{ payer, amount, participants[] }] }' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || !Array.isArray(body.expenses)) {
    return res.status(400).json({ error: 'Send JSON: { "expenses": [...] }' });
  }
  const result = settle(body.expenses);
  res.status(200).json({ ...result, computedBy: 'Vercel Serverless Function', at: new Date().toISOString() });
};

module.exports.settle = settle;
