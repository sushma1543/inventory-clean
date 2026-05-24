import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getData() {
  const products = await prisma.product.findMany({
    include: { stocks: { include: { warehouse: true } } }
  });

  const reservations = await prisma.reservation.findMany({
    include: { product: true, warehouse: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return { products, reservations };
}

export default async function AdminPage() {
  const { products, reservations } = await getData();

  const totalProducts = products.length;
  const totalWarehouses = new Set(products.flatMap((p: any) => p.stocks.map((s: any) => s.warehouse.id))).size;
  const totalAvailable = products.reduce((sum: number, p: any) => sum + p.stocks.reduce((s: number, st: any) => s + (st.totalUnits - st.reservedUnits), 0), 0);

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin — Inventory Dashboard</h1>
          <Link href="/" className="text-sm text-zinc-300 underline">Store</Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-zinc-800">
            <div className="text-sm text-zinc-400">Products</div>
            <div className="text-2xl font-bold mt-2">{totalProducts}</div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-800">
            <div className="text-sm text-zinc-400">Warehouses</div>
            <div className="text-2xl font-bold mt-2">{totalWarehouses}</div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-800">
            <div className="text-sm text-zinc-400">Available units</div>
            <div className="text-2xl font-bold mt-2">{totalAvailable}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-800">
            <h2 className="font-semibold mb-4">Products</h2>
            <div className="space-y-4">
              {products.map((p: any) => (
                <div key={p.id} className="border-b border-zinc-700 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-zinc-400">{p.description}</div>
                    </div>
                    <div className="text-sm text-zinc-400">{p.stocks.reduce((s: number, st: any) => s + (st.totalUnits - st.reservedUnits), 0)} available</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-800">
            <h2 className="font-semibold mb-4">Recent Reservations</h2>
            <div className="space-y-4">
              {reservations.map((r: any) => (
                <div key={r.id} className="border-b border-zinc-700 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{r.product.name} — {r.warehouse.name}</div>
                      <div className="text-sm text-zinc-400">{r.quantity} units · {r.status}</div>
                    </div>
                    <div className="text-sm text-zinc-400">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
