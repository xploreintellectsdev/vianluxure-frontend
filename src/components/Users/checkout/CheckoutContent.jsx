"use client";
import { useCart } from "@/components/Users/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ShieldCheck, Truck, Sparkles } from "lucide-react";

const BUY_NOW_KEY = "vian_buy_now";

const CheckoutContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";

  const { cart, removeFromCart } = useCart();
  const [buyNowItems, setBuyNowItems] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!isBuyNow) {
      setBuyNowItems(null);
      return;
    }
    try {
      const raw = localStorage.getItem(BUY_NOW_KEY);
      const items = raw ? JSON.parse(raw) : [];
      setBuyNowItems(items.map((item, i) => ({ ...item, cartItemId: item.cartItemId || `buynow-${i}` })));
    } catch (err) {
      console.error("Failed to load buy-now item", err);
      setBuyNowItems([]);
    }
  }, [isBuyNow]);

  const items = isBuyNow ? buyNowItems : cart;
  const isLoading = isBuyNow && buyNowItems === null;

  useEffect(() => {
    if (!items) return;
    const initialQuantities = {};
    items.forEach(item => {
      initialQuantities[item.cartItemId] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [items]);

  const handleQuantityChange = (key, newQuantity) => {
    const qty = Math.max(1, newQuantity);
    setQuantities(prev => ({ ...prev, [key]: qty }));
  };

  const handleRemove = (cartItemId) => {
    if (isBuyNow) {
      localStorage.removeItem(BUY_NOW_KEY);
      setBuyNowItems([]);
    } else {
      removeFromCart(cartItemId);
    }
  };

  const totals = (() => {
    const list = items || [];
    let subtotal = 0;
    let gst = 0;
    let stitchingCharge = 0;
    let rtwStitchingCharge = 0;
    let hasCustomItem = false;

    list.forEach((item) => {
      const itemQty = quantities[item.cartItemId || item.id] || item.quantity || 1;
      const itemSubtotal = item.price * itemQty;
      subtotal += itemSubtotal;

      // GST is inclusive in MRP
      gst = 0;

      const isFabricOnly = item.type === 'fabric' || item.category === 'Fabric';
      const isRtw = item.type === 'rtw' || item.type === 'ready-to-wear' || item.product_type === 'rtw';
      const isCustom = item.type === 'bespoke' || item.type === 'made-to-wear';
      if (isCustom) hasCustomItem = true;

      const costStitching = isFabricOnly ? 0 : (Number(item.stitching_charges || item.fab_stitching_charges) || 0);

      if (isRtw) {
        rtwStitchingCharge += costStitching * itemQty;
      } else {
        stitchingCharge += costStitching * itemQty;
      }
    });

    const shipping = 0;
    const grandTotal = subtotal + gst + stitchingCharge + shipping;
    return { subtotal, gst, stitchingCharge, rtwStitchingCharge, shipping, grandTotal, hasCustomItem };
  })();

  if (isLoading) {
    return <div className="bg-gradient-to-b from-[#FAF9F6] to-[#F3F1EC] min-h-screen py-24 px-4" />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#FAF9F6] to-[#F3F1EC] text-gray-900 min-h-screen py-24 px-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif text-center mb-10 tracking-widest">(YOUR SHOPPING CART)</h1>
        <div className="w-20 h-20 rounded-full bg-white shadow-inner flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-[#C8A64D]" strokeWidth={1.5} />
        </div>
        <p className="text-lg text-gray-400 tracking-wide">Your cart is empty.</p>
        <Link
          href="/shop/fabric"
          className="inline-block mt-8 bg-[#C8A64D] text-white text-sm font-semibold tracking-widest py-3.5 px-10 rounded-full hover:bg-[#b8974a] hover:shadow-lg hover:shadow-[#C8A64D]/25 transition-all duration-300"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#FAF9F6] to-[#F3F1EC] min-h-screen py-24 px-4 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-[0.6875rem] tracking-[0.2em] text-[#C8A64D] font-semibold mb-4">
            <Sparkles size={13} /> TAILORED FOR YOU
          </span>
          <h1 className="text-4xl font-serif tracking-widest text-gray-900">(YOUR SHOPPING CART)</h1>
          <p className="mt-3 text-xs tracking-widest text-gray-400 uppercase">
            {items.length} {items.length === 1 ? "item" : "items"} ready for checkout
          </p>
          <div className="w-16 h-[0.125rem] bg-[#C8A64D] mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {items.map(item => {
              const qty = quantities[item.cartItemId] || item.quantity;
              return (
                <div
                  key={item.cartItemId}
                  className="group relative flex flex-col sm:flex-row gap-7 p-7 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(200,166,77,0.18)] hover:-translate-y-0.5"
                >
                  <div className="relative w-full sm:w-36 h-36 shrink-0 rounded-2xl overflow-hidden bg-[#F5F5F3] ring-1 ring-black/5 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-semibold text-gray-900 leading-snug">{item.name}</h2>
                      <button
                        onClick={() => handleRemove(item.cartItemId)}
                        aria-label="Remove item"
                        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.shortDesc || "Premium quality fabric."}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.type === 'fabric' && (
                        <span className="text-[#C8A64D] font-semibold text-[0.6875rem] tracking-wide bg-[#C8A64D]/10 border border-[#C8A64D]/20 px-3 py-1 rounded-full">
                          LENGTH: {qty.toFixed(2)} METER
                        </span>
                      )}

                      {/* NEW RTW, MADE-TO-WEAR, AND BESPOKE UI */}
                      {['rtw', 'made-to-wear', 'bespoke'].includes(item.type) && (item.size || item.fit) && (
                        <span className="text-[#C8A64D] font-semibold text-[0.6875rem] tracking-wide bg-[#C8A64D]/10 border border-[#C8A64D]/20 px-3 py-1 rounded-full">
                          {item.size && `SIZE: ${item.size}`}
                          {item.size && item.fit && "  •  "}
                          {item.fit && `FIT: ${item.fit}`}
                        </span>
                      )}
                    </div>

                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-[#C8A64D]/30 flex flex-col gap-1">
                        {item.customizations.map((cust, idx) => (
                          <p key={idx} className="text-[0.6875rem] text-gray-600 capitalize">
                            <span className="font-semibold text-gray-800">{cust.type}:</span> {cust.name}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-end justify-between mt-auto pt-4">
                      <p className="text-2xl font-bold text-gray-900 tracking-tight">
                        Rs. {(item.price * qty).toLocaleString("en-IN")}<span className="text-sm font-medium text-gray-400">/-</span>
                      </p>
                      {!isBuyNow && (
                        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-[#FAFAF8]">
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, qty - 1)}
                            className="w-9 h-9 flex items-center justify-center text-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
                          >
                            −
                          </button>
                          <span className="px-4 py-2 font-semibold text-sm min-w-[2.75rem] text-center">{qty}</span>
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, qty + 1)}
                            className="w-9 h-9 flex items-center justify-center text-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="relative bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#C8A64D] via-[#e6c886] to-[#C8A64D]" />

              <div className="p-8">
                <h3 className="text-lg font-serif text-gray-900 pb-4 mb-6 tracking-widest border-b border-gray-100">
                  ORDER SUMMARY
                </h3>

                <div className="space-y-4 text-sm">
                  <SummaryRow label="Subtotal (MRP)" value={totals.subtotal} />
                  <SummaryRow label="GST (Inclusive)" value={null} isIncluded />
                  {(totals.stitchingCharge > 0 || totals.hasCustomItem) && (
                    <SummaryRow label="Stitching Charge" value={totals.stitchingCharge} />
                  )}
                  {totals.rtwStitchingCharge > 0 && (
                    <SummaryRow label="Stitching Charge" value={null} isIncluded />
                  )}
                  <SummaryRow label="Shipping" value={totals.shipping} isFree={totals.shipping === 0} />
                </div>

                <div className="border-t border-dashed border-gray-200 mt-6 pt-6 flex justify-between items-center">
                  <span className="font-bold text-base text-gray-900 tracking-wide">TOTAL</span>
                  <span className="font-bold text-3xl text-gray-900 tracking-tight">
                    Rs. {totals.grandTotal.toLocaleString("en-IN")}<span className="text-base font-medium text-gray-400">/-</span>
                  </span>
                </div>

                <Link
                  href={isBuyNow ? "/checkout/address?buyNow=true" : "/checkout/address"}
                  className="block text-center w-full mt-8 bg-[#C8A64D] text-white text-sm font-semibold tracking-widest py-4 px-6 rounded-full hover:bg-[#b8974a] hover:shadow-lg hover:shadow-[#C8A64D]/30 active:scale-[0.98] transition-all duration-300"
                >
                  PROCEED TO CHECKOUT →
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#C8A64D]" />
                    <span>Secure checkout, encrypted payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-[#C8A64D]" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, isFree = false, isIncluded = false }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}</span>
    {isFree ? (
      <span className="text-green-600 font-bold text-xs tracking-wide bg-green-50 px-2.5 py-1 rounded-full">FREE</span>
    ) : isIncluded ? (
      <span className="text-emerald-700 font-bold text-xs tracking-wide bg-emerald-50 px-2.5 py-1 rounded-full">
        {value !== null && value !== undefined ? `Rs. ${Number(value).toLocaleString("en-IN")}/- (INCLUDED)` : "INCLUDED"}
      </span>
    ) : (
      <span className="text-gray-900 font-medium">Rs. {(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</span>
    )}
  </div>
);

export default CheckoutContent;