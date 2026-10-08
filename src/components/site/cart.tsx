"use client";

/**
 * Client-only demo cart. Nothing leaves the browser: lines are kept in
 * memory and in localStorage (per visitor, per brand). Checkout is a mock.
 */
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface CartLine { productId: string; size?: string; color?: string; quantity: number }

interface CartState {
  lines: CartLine[];
  catalog: Record<string, CatalogItem>;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (index: number, quantity: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  subtotal: number;
  count: number;
  threshold?: number;
  promoText?: string;
  cartHref?: string;
}

const CartContext = createContext<CartState | null>(null);
const MAX_QUANTITY = 9;

export function useCart(): CartState | null {
  return useContext(CartContext);
}

function readStored(key: string): CartLine[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((l) => l && typeof l.productId === "string" && Number.isInteger(l.quantity)).slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ brand, catalog, threshold, promoText, cartHref, children }: {
  brand: string; catalog: CatalogItem[]; threshold?: number; promoText?: string; cartHref?: string; children: ReactNode;
}) {
  const storageKey = `demo-cart:${brand}`;
  const byId = useMemo(() => Object.fromEntries(catalog.map((item) => [item.id, item])), [catalog]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Restoring from browser storage has to happen after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStored(storageKey).filter((line) => byId[line.productId]));
    setLoaded(true);
  }, [storageKey, byId]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {
      // Storage can be unavailable (private mode). The cart still works in memory.
    }
  }, [lines, loaded, storageKey]);

  const add = useCallback((line: Omit<CartLine, "quantity">) => {
    setLines((current) => {
      const index = current.findIndex((l) => l.productId === line.productId && l.size === line.size && l.color === line.color);
      if (index === -1) return [...current, { ...line, quantity: 1 }];
      return current.map((l, i) => (i === index ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + 1) } : l));
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback((index: number, quantity: number) => {
    setLines((current) => (quantity <= 0 ? current.filter((_, i) => i !== index) : current.map((l, i) => (i === index ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l))));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const subtotal = lines.reduce((sum, line) => sum + (byId[line.productId]?.price ?? 0) * line.quantity, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const value: CartState = { lines, catalog: byId, add, setQuantity, clear, open, setOpen, subtotal, count, threshold, promoText, cartHref };
  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);

export function ShippingProgress() {
  const cart = useCart();
  if (!cart?.threshold) return null;
  const remaining = cart.threshold - cart.subtotal;
  return (
    <p className="cart-shipping">
      {remaining > 0 ? `You are ${money(remaining)} away from free shipping.` : "Your order ships free."}
    </p>
  );
}

export function CartLines({ editable = true }: { editable?: boolean }) {
  const cart = useCart();
  if (!cart) return null;
  if (cart.lines.length === 0) return <p className="muted">Your bag is empty.</p>;
  return (
    <ul className="cart-lines">
      {cart.lines.map((line, index) => {
        const item = cart.catalog[line.productId];
        if (!item) return null;
        return (
          <li key={`${line.productId}-${line.size}-${line.color}`} className="cart-line">
            {item.imageUrl
              ? <img src={`${item.imageUrl}?w=160&fm=webp&q=70`} alt={item.imageAlt ?? ""} width={80} height={80} className="cart-thumb" />
              : <span className="cart-thumb" aria-hidden="true" />}
            <div className="cart-line-info">
              <Link href={item.href} className="cart-line-name">{item.name}</Link>
              <span className="muted">{[line.color, line.size].filter(Boolean).join(" / ")}</span>
              <span>{money(item.price * line.quantity)}</span>
            </div>
            {editable && (
              <div className="cart-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                <button type="button" onClick={() => cart.setQuantity(index, line.quantity - 1)} aria-label="Decrease quantity">-</button>
                <span aria-live="polite">{line.quantity}</span>
                <button type="button" onClick={() => cart.setQuantity(index, line.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function CartDrawer() {
  const cart = useCart();
  useEffect(() => {
    if (!cart?.open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && cart.setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart]);
  if (!cart?.open) return null;
  return (
    <div className="drawer-backdrop" onClick={() => cart.setOpen(false)}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your bag" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <h2>Your bag ({cart.count})</h2>
          <button type="button" className="drawer-close" onClick={() => cart.setOpen(false)} aria-label="Close bag">Close</button>
        </div>
        <ShippingProgress />
        <CartLines />
        <div className="drawer-foot">
          <p className="cart-subtotal"><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></p>
          {cart.promoText && <p className="muted small">{cart.promoText}</p>}
          {cart.cartHref && <Link className="btn btn-primary btn-block" href={cart.cartHref} onClick={() => cart.setOpen(false)}>View bag and check out</Link>}
        </div>
      </aside>
    </div>
  );
}

export function CartButton() {
  const cart = useCart();
  if (!cart) return null;
  return (
    <button type="button" className="cart-button" onClick={() => cart.setOpen(true)} aria-label={`Open bag, ${cart.count} items`}>
      Bag <span className="cart-count">{cart.count}</span>
    </button>
  );
}

export function AddToBagButton({ label, className, productId }: { label: string; className?: string; productId: string }) {
  const cart = useCart();
  return (
    <button type="button" className={className} disabled={!cart} onClick={() => cart?.add({ productId })}>{label}</button>
  );
}

/** Size, color, and add to bag on a product page. */
export function ProductPurchase({ productId, label, sizes, colors }: {
  productId: string; label: string; sizes: string[]; colors: Array<{ name: string; className: string }>;
}) {
  const cart = useCart();
  const [size, setSize] = useState<string | undefined>(sizes.length === 1 ? sizes[0] : undefined);
  const [color, setColor] = useState<string | undefined>(colors[0]?.name);
  const [error, setError] = useState<string>();
  return (
    <div className="purchase">
      {colors.length > 0 && (
        <fieldset className="option-group">
          <legend>Color: <strong>{color}</strong></legend>
          <div className="swatches">
            {colors.map((c) => (
              <button key={c.name} type="button" className={`swatch ${c.className} ${color === c.name ? "is-selected" : ""}`}
                aria-pressed={color === c.name} aria-label={c.name} title={c.name} onClick={() => setColor(c.name)} />
            ))}
          </div>
        </fieldset>
      )}
      {sizes.length > 1 && (
        <fieldset className="option-group">
          <legend>Size{size ? <>: <strong>{size}</strong></> : null}</legend>
          <div className="sizes">
            {sizes.map((s) => (
              <button key={s} type="button" className={`size ${size === s ? "is-selected" : ""}`} aria-pressed={size === s}
                onClick={() => { setSize(s); setError(undefined); }}>{s}</button>
            ))}
          </div>
        </fieldset>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="btn btn-primary btn-block" disabled={!cart}
        onClick={() => {
          if (sizes.length > 1 && !size) return setError("Choose a size.");
          cart?.add({ productId, size, color });
        }}>
        {label}
      </button>
    </div>
  );
}

/** Bag contents and totals on the cart page, above the mock checkout. */
export function CartSummary() {
  const cart = useCart();
  if (!cart || cart.lines.length === 0) return null;
  return (
    <div className="cart-summary">
      <h2>In your bag</h2>
      <ShippingProgress />
      <CartLines />
      {cart.lines.length > 0 && <p className="cart-subtotal"><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></p>}
    </div>
  );
}
