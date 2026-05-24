"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WarehouseStock = {
  id: string;
  totalUnits: number;
  reservedUnits: number;
  warehouse: {
    id: string;
    name: string;
    city: string;
  };
};

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  stocks: WarehouseStock[];
};

const getImageUrl = (image: string, width: number) =>
  image.includes("?")
    ? `${image}&auto=format&fit=crop&w=${width}&q=80`
    : `${image}?auto=format&fit=crop&w=${width}&q=80`;

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function Home() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("cart_items");
        const items = raw ? JSON.parse(raw) : [];
        setCartCount(items.length || 0);
      } catch (e) {
        setCartCount(0);
      }
    };

    read();

    const onStorage = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart-updated", onStorage as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart-updated", onStorage as any);
    };
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load products");
      const data: Product[] = await res.json();
      setProducts(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Unable to load products. Refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [product.name, product.description, product.category].some((value) =>
        value.toLowerCase().includes(query)
      );
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 60_000);
    return () => clearInterval(interval);
  }, []);

  const totalAvailable = products.reduce((sum, product) => {
    return sum + product.stocks.reduce((stockSum, stock) => stockSum + (stock.totalUnits - stock.reservedUnits), 0);
  }, 0);

  const totalWarehouses = new Set(products.flatMap((product) => product.stocks.map((stock) => stock.warehouse.id))).size;
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl mb-10">
          <div className="flex items-start justify-end">
            <Link href="/cart" className="ml-auto inline-flex items-center gap-3 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              View Cart
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-black">{cartCount}</span>
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">Sushma Bazaar storefront</span>
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">Shop top deals on mobiles, fashion, home essentials, and more.</h1>
              <p className="max-w-2xl text-xl text-slate-300">Discover a marketplace-style experience with search, category filters, and curated live inventory across India.</p>

              <div className="grid gap-4 rounded-[2rem] border border-zinc-800 bg-slate-900/90 p-5 shadow-inner shadow-black/10">
                <label className="sr-only" htmlFor="search">Search products</label>
                <div className="relative">
                  <input
                    id="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search phones, fashion, home, electronics..."
                    className="w-full rounded-3xl border border-zinc-700 bg-slate-950 px-5 py-4 pr-28 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
                  />
                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">Search</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['All', ...categories].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${activeCategory === category ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-emerald-400 hover:text-emerald-200'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl shadow-black/40">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-zinc-950/80 p-5">
                  <div>
                    <p className="text-sm text-zinc-400">Live inventory</p>
                    <p className="text-3xl font-bold text-white">{products.length} products</p>
                  </div>
                  <div className="text-right text-sm text-zinc-400">
                    <p>{totalWarehouses} warehouses</p>
                    <p>{totalAvailable} units available</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">
                  <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">Flash offer</div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">Lowest prices today</div>
                      <p className="mt-2 text-sm text-zinc-400">Reserve now and get Indian-style delivery from nearby warehouses.</p>
                    </div>
                    <div className="rounded-3xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">Marketplace deals</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-400">Updated at {loading ? "loading..." : lastUpdated}</div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-3xl bg-rose-950/90 border border-rose-600 p-5 text-rose-200 mb-8">{error}</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40">
              <div className="relative h-72 overflow-hidden bg-zinc-900">
                <img
                  src={getImageUrl(product.image, 900)}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-300">{product.category}</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold text-white">{product.name}</h2>
                    <div className="rounded-3xl bg-emerald-500/10 px-3 py-2 text-right text-white">
                      <div className="text-sm text-zinc-400">Starting at</div>
                      <div className="text-xl font-bold">{formatCurrency(product.price ?? 0)}</div>
                    </div>
                  </div>
                  <p className="text-zinc-400 line-clamp-3">{product.description}</p>
                </div>
                <div className="space-y-4">
                  {product.stocks.slice(0, 2).map((stock) => {
                    const available = stock.totalUnits - stock.reservedUnits;
                    const percent = Math.round((available / Math.max(stock.totalUnits, 1)) * 100);
                    return (
                      <div key={stock.id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-white">{stock.warehouse.name}</div>
                            <div className="text-sm text-zinc-500">{stock.warehouse.city}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-semibold">{available}</div>
                            <div className="text-xs text-zinc-500">available</div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href={`/reserve/${product.id}`}
                  className="block rounded-3xl bg-emerald-400 py-3 text-center font-semibold text-black transition hover:bg-emerald-300"
                >
                  Reserve now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
