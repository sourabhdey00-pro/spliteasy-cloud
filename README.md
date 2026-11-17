# SplitEasy — Cloud Expense Splitter

A small cloud application for splitting trip / hostel / group expenses.
You enter who paid what, and a **serverless function running on Vercel** calculates
each person's balance and the fewest payments needed to settle everyone up.

## Architecture
- `public/index.html` — static frontend (HTML/CSS/JS), served from Vercel's global CDN
- `api/split.js` — Node.js serverless function, exposed at `POST /api/split`
- No servers to manage: Vercel builds and deploys automatically on every `git push`

## Run the logic locally
```
npm test
```

## API
`POST /api/split`
```json
{ "expenses": [ { "payer": "Amit", "amount": 600, "participants": ["Amit", "Riya", "Sam"] } ] }
```
Returns `total`, `balances` and `payments` (`from`, `to`, `amount`).

## Deploy
1. Push this repo to GitHub
2. vercel.com → Add New → Project → Import the repo → Deploy
