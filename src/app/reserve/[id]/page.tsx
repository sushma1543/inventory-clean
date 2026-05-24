"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

type Reservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservePage() {
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [time, setTime] = useState(600);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  const loadProduct = async () => {
    if (!productId) return;

    const res = await fetch("/api/products", {
      cache: "no-store",
    });

    if (!res.ok) {
      setMessage("Unable to load product details.");
      return;
    }

    const products: Product[] = await res.json();
    const item = products.find((product) => product.id === productId);

    if (!item) {
      setMessage("Product not found.");
      return;
    }

    setProduct(item);
    const availableStock = item.stocks.find(
      (stock) => stock.totalUnits - stock.reservedUnits > 0
    );

    setSelectedWarehouseId(availableStock?.warehouse.id ?? item.stocks[0]?.warehouse.id ?? "");
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!reservation) {
      setTime(600);
      return;
    }

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation]);

  useEffect(() => {
    if (time === 0 && reservation) {
      setMessage("Your reservation has expired. Please try again.");
      setReservation(null);
    }
  }, [time, reservation]);

  const availableStock = useMemo(() => {
    if (!product || !selectedWarehouseId) return 0;
    const stock = product.stocks.find(
      (stock) => stock.warehouse.id === selectedWarehouseId
    );
    return stock ? stock.totalUnits - stock.reservedUnits : 0;
  }, [product, selectedWarehouseId]);

  const selectedWarehouse = useMemo(() => {
    return product?.stocks.find(
      (stock) => stock.warehouse.id === selectedWarehouseId
    );
  }, [product, selectedWarehouseId]);

  const shippingAddress = [addressLine1, addressLine2, city, stateValue, postalCode, country]
    .filter(Boolean)
    .join(", ");

  const createReservation = async () => {
    if (!product || !selectedWarehouseId) return;
    if (quantity < 1 || quantity > availableStock) {
      setMessage("Enter a valid quantity within available stock.");
      return;
    }
    if (!addressLine1 || !city || !postalCode) {
      setMessage("Please enter your shipping address before reserving.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        warehouseId: selectedWarehouseId,
        quantity,
        shippingAddress,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to create reservation.");
      return;
    }

    setReservation(data);
    setMessage("Reservation created. Confirm or cancel before it expires.");

    await loadProduct();
  };

  const addToCart = () => {
    if (!product || !selectedWarehouseId) return setMessage("Select a warehouse first.");
    if (quantity < 1 || quantity > availableStock) return setMessage("Enter a valid quantity within available stock.");
    if (!addressLine1 || !city || !postalCode) return setMessage("Please enter your shipping address before adding to cart.");

    const shipping = [addressLine1, addressLine2, city, stateValue, postalCode, country].filter(Boolean).join(", ");
    try {
      const raw = localStorage.getItem("cart_items");
      const items = raw ? JSON.parse(raw) : [];
      items.push({ productId: product.id, warehouseId: selectedWarehouseId, quantity, shippingAddress: shipping });
      localStorage.setItem("cart_items", JSON.stringify(items));
      setMessage("Added to cart.");
    } catch (e) {
      setMessage("Failed to add to cart.");
    }
    // notify other tabs / header about cart change
    try { window.dispatchEvent(new Event('cart-updated')); } catch (e) {}
  };

  const confirmReservation = async () => {
    if (!reservation) return;

    setLoading(true);
    const res = await fetch(`/api/reservations/${reservation.id}/confirm`, {
      method: "POST",
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to confirm purchase.");
      return;
    }

    setMessage("Purchase confirmed successfully.");
    setReservation(null);
    await loadProduct();
  };

  const cancelReservation = async () => {
    if (!reservation) return;

    setLoading(true);
    const res = await fetch(`/api/reservations/${reservation.id}/release`, {
      method: "POST",
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to cancel reservation.");
      return;
    }

    setMessage("Reservation cancelled successfully.");
    setReservation(null);
    await loadProduct();
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const totalPrice = (product?.price ?? 0) * quantity;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-8 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="lg:w-1/2">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
                <img
                  src={getImageUrl(product?.image ?? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8", 1200)}
                  alt={product?.name ?? "Product"}
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-emerald-300">Order summary</div>
                <div className="mt-4 space-y-3 text-zinc-300">
                  <p className="text-lg font-semibold">{product?.name}</p>
                  <p>{product?.description}</p>
                  <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900 p-4">
                    <span className="text-sm text-zinc-400">Price per unit</span>
                    <span className="text-xl font-semibold text-white">{formatCurrency(product?.price ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900 p-4">
                    <span className="text-sm text-zinc-400">Quantity</span>
                    <span className="text-xl font-semibold text-white">{quantity}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-3xl bg-emerald-500/10 p-4 text-emerald-300">
                    <span className="font-semibold">Estimated total</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-6">
              <div className="space-y-4 rounded-[2rem] border border-emerald-500/10 bg-zinc-900/90 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-emerald-300">Reserve & ship</p>
                    <h1 className="text-3xl font-bold">{product?.name ?? "Loading product"}</h1>
                  </div>
                  <div className="rounded-3xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">{product?.category}</div>
                </div>
                <p className="text-zinc-400">Choose your warehouse and delivery address to reserve stock instantly. Confirm before expiration and get ready for fast pickup or shipping.</p>
              </div>

              <div className="grid gap-4 rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Choose warehouse</h2>
                  {product?.stocks.map((stock) => {
                    const available = stock.totalUnits - stock.reservedUnits;
                    return (
                      <button
                        key={stock.id}
                        type="button"
                        onClick={() => setSelectedWarehouseId(stock.warehouse.id)}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${stock.warehouse.id === selectedWarehouseId ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950"}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-white">{stock.warehouse.name}</div>
                            <div className="text-sm text-zinc-400">{stock.warehouse.city}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-300 font-semibold">{available}</div>
                            <div className="text-xs text-zinc-500">available</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Selected warehouse</p>
                      <p className="font-semibold text-white">{selectedWarehouse?.warehouse.name ?? "None"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Available</p>
                      <p className="text-emerald-400 font-semibold">{availableStock}</p>
                    </div>
                  </div>
                  <label className="block">
                    <span className="text-sm text-zinc-400">Quantity</span>
                    <input
                      type="number"
                      min={1}
                      max={availableStock}
                      value={quantity}
                      onChange={(event) => setQuantity(Number(event.target.value))}
                      className="mt-2 w-full rounded-3xl border border-zinc-700 bg-slate-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </div>

                <div className="space-y-4 rounded-3xl border border-zinc-800 bg-slate-950 p-5">
                  <div className="text-lg font-semibold text-white">Shipping address</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-zinc-400">Street address</span>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(event) => setAddressLine1(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-zinc-400">Apartment, suite, etc.</span>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(event) => setAddressLine2(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-zinc-400">City</span>
                      <input
                        type="text"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-zinc-400">State</span>
                      <input
                        type="text"
                        value={stateValue}
                        onChange={(event) => setStateValue(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-zinc-400">Postal code</span>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(event) => setPostalCode(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-zinc-400">Country</span>
                      <input
                        type="text"
                        value={country}
                        onChange={(event) => setCountry(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={createReservation}
                    disabled={loading || availableStock === 0}
                    className="flex-1 rounded-3xl bg-emerald-400 py-4 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Saving cart..." : reservation ? "Reservation active" : "Add to cart & reserve"}
                  </button>
                  <button
                    onClick={addToCart}
                    disabled={loading || availableStock === 0}
                    className="flex-1 rounded-3xl border border-zinc-700 bg-zinc-900 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save to cart
                  </button>
                </div>

                {reservation && (
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">Reservation expires in</p>
                        <p className="text-3xl font-bold text-emerald-300">{minutes}:{seconds.toString().padStart(2, "0")}</p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={confirmReservation}
                          disabled={loading}
                          className="rounded-3xl bg-white py-3 px-6 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm purchase
                        </button>
                        <button
                          onClick={cancelReservation}
                          disabled={loading}
                          className="rounded-3xl border border-rose-500 bg-rose-600/10 py-3 px-6 text-sm font-semibold text-rose-200 transition hover:bg-rose-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel reservation
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 rounded-3xl bg-zinc-900 p-4 text-sm text-zinc-300">
                      <p><span className="font-semibold text-white">Ship to:</span> {shippingAddress || "Enter address above"}</p>
                      <p className="mt-2 text-zinc-500">Warehouse pickup: {selectedWarehouse?.warehouse.name}, {selectedWarehouse?.warehouse.city}</p>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="rounded-3xl bg-zinc-900 p-4 text-sm text-zinc-200">{message}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
