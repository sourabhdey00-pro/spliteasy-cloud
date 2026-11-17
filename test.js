const { settle } = require('./api/split');
const r = settle([
  { payer: 'Amit', amount: 1200, participants: ['Amit', 'Riya', 'Sam', 'Neha'] },
  { payer: 'Riya', amount: 600, participants: ['Riya', 'Sam'] },
  { payer: 'Neha', amount: 900, participants: ['Amit', 'Riya', 'Sam', 'Neha'] },
]);
console.log(JSON.stringify(r, null, 2));
const sum = Object.values(r.balances).reduce((a, b) => a + b, 0);
if (Math.abs(sum) > 0.05) throw new Error('Balances do not sum to zero');
console.log('OK');
