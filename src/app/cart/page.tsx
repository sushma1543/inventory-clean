"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CartItem = {
  productId: string;
  warehouseId: string;
  quantity: number;
  shippingAddress?: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  stocks: any[];
};

const getImageUrl = (image: string, width: number) =>
  image.includes("?")
    ? `${image}&auto=format&fit=crop&w=${width}&q=60`
    : `${image}?auto=format&fit=crop&w=${width}&q=60`;

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("cart_items");
    if (raw) {
      try {
        setCart(JSON.parse(raw));
      } catch (e) {
        setCart([]);
      }
    }

    // load products to display basic info and price
    (async () => {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(cart));
    try { window.dispatchEvent(new Event("cart-updated")); } catch (e) {}
  }, [cart]);

  const addMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  };

  const removeItem = (index: number) => {
    setCart((c) => c.filter((_, i) => i !== index));
    addMessage("Removed from cart");
  };

  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const grandTotal = cart.reduce((sum, it) => {
    const p = productMap.get(it.productId);
    return sum + (p?.price ?? 0) * it.quantity;
  }, 0);

  const createAllReservations = async () => {
    if (cart.length === 0) return addMessage("Cart is empty");
    setLoading(true);
    setMessage(null);
    const results: string[] = [];
    const failedItems: CartItem[] = [];

    for (const item of cart) {
      try {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            warehouseId: item.warehouseId,
            quantity: item.quantity,
            shippingAddress: item.shippingAddress,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          results.push(`Failed ${item.productId}: ${data?.error ?? "unknown"}`);
          failedItems.push(item);
        } else {
          results.push(`Reserved ${item.productId}: ${data.id}`);
        }
      } catch (e) {
        results.push(`Error ${item.productId}`);
        failedItems.push(item);
      }
    }

    setLoading(false);
    addMessage("Reservation results: " + results.join("; "));
    setCart(failedItems);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <Link href="/" className="text-sm text-emerald-300">Continue shopping</Link>
        </div>

        {message && <div className="mb-4 rounded-3xl bg-zinc-900 p-4 text-sm">{message}</div>}

        <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
          <div className="space-y-4">
            {cart.length === 0 && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">Your cart is empty.</div>
            )}

            {cart.map((item, i) => {
              const p = productMap.get(item.productId);
              const image = p?.image ?? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8";
              return (
                <div key={i} className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center">
                  <img src={getImageUrl(image, 300)} alt={p?.name} className="h-28 w-full rounded-3xl object-cover sm:w-32" />
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-semibold text-white">{p?.name ?? item.productId}</div>
                        <div className="text-sm text-zinc-400">{p?.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{formatCurrency(p?.price ?? 0)}</div>
                        <div className="text-sm text-zinc-400">Qty {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400">{item.shippingAddress}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <button onClick={() => removeItem(i)} className="rounded-full border border-rose-500/40 bg-rose-600/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-600/20">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="space-y-6 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/20">
            <div className="rounded-3xl bg-slate-900/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Order summary</p>
                  <p className="mt-2 text-sm text-zinc-400">Review your cart before checkout.</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">Secure</div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>Items</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-emerald-300">Free</span>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Total</span>
                    <span className="text-white font-semibold text-xl">{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">You can reserve stock and confirm payment later.</p>
                </div>
              </div>
            </div>

            <button
              onClick={createAllReservations}
              disabled={loading || cart.length === 0}
              className="w-full rounded-3xl bg-emerald-400 py-4 text-base font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : "Proceed to Reserve"}
            </button>

            <div className="rounded-3xl border border-zinc-800 bg-slate-900/90 p-5 text-sm text-zinc-400">
              <p className="font-medium text-white">Need help?</p>
              <p className="mt-2">Call our customer support or change your shipping address before checkout.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
