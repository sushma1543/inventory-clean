// Run with Node 18+
// Usage: node scripts/concurrent-reserve.js http://localhost:3000 10 productId warehouseId quantity

const [,, base, count, productId, warehouseId, qty] = process.argv;
if (!base || !count || !productId || !warehouseId || !qty) {
  console.error('Usage: node scripts/concurrent-reserve.js <baseUrl> <concurrentRequests> <productId> <warehouseId> <quantity>');
  process.exit(1);
}

const N = Number(count);
const url = new URL('/api/reservations', base).toString();

async function run() {
  const promises = [];
  for (let i = 0; i < N; i++) {
    promises.push(fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, warehouseId, quantity: Number(qty) })
    }).then(async (r) => ({ status: r.status, body: await r.text() })).catch((e) => ({ error: String(e) })));
  }

  const results = await Promise.all(promises);
  results.forEach((r, i) => {
    console.log(i, r.status ?? 'ERR', r.error ? r.error : r.body);
  });
}

run().catch(console.error);
