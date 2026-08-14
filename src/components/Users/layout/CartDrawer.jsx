"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/components/Users/context/CartContext";
import { useRouter } from "next/navigation";

const CartDrawer = () => {
  const router = useRouter();

  const {
    cart, removeFromCart,
    wishlist, removeFromWishlist, moveToCart,
    isCartOpen, activeDrawerTab, openDrawer, closeDrawer,
  } = useCart();

  // FIX: Added a fallback calculation so it NEVER crashes even if an old item is missing totalPrice
  const subtotal = cart.reduce((total, item) => {
    const itemTotal = item.totalPrice || (item.price * (item.quantity || 1)) || 0;
    return total + itemTotal;
  }, 0);

  // Lock scrolling when drawer is open
  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100000]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[100001] shadow-2xl flex flex-col"
          >
            {/* Close Button */}
            <button onClick={closeDrawer} className="absolute right-6 top-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10">
              <X size={20} className="text-gray-600" />
            </button>

            {/* Header Tabs */}
            <div className="flex w-full border-b border-gray-100 pt-4 shrink-0">
              {["wishlist", "cart"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => openDrawer(tab)}
                  className="flex-1 relative py-6 text-[0.9375rem] font-medium uppercase tracking-wider"
                >
                  <span className={activeDrawerTab === tab ? "text-black" : "text-gray-400"}>
                    {tab === "wishlist" ? `Wish List (${wishlist.length})` : `Cart (${cart.length})`}
                  </span>
                  {activeDrawerTab === tab && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
                {activeDrawerTab === "wishlist" ? "Wish List" : "Cart"}
              </h2>

              {/* ── RENDER CART ── */}
              {activeDrawerTab === "cart" && cart.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {cart.map((item, index) => {
                    // FIX: Safe fallback calculation for rendering the price text safely
                    const displayPrice = item.totalPrice || (item.price * (item.quantity || 1)) || 0;
                    const displayName = item.name || item.title || "Unnamed Item";

                    return (
                      <div key={item.cartItemId ?? `${item.id}-${index}`} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                        <div className="w-20 h-24 bg-gray-200 rounded-md overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{displayName[0]}</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">{displayName}</h3>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{item.type} • {item.quantity} {item.type === 'fabric' ? 'Meters' : 'Qty'}</p>
                          <p className="text-sm font-bold text-[#A67C3D] mt-2">₹{displayPrice.toLocaleString("en-IN")}</p>
                        </div>

                        <button onClick={() => removeFromCart(item.cartItemId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : activeDrawerTab === "wishlist" && wishlist.length > 0 ? (

                /* ── RENDER WISHLIST ── */
                <div className="flex flex-col gap-6">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                      <div className="w-20 h-24 bg-gray-200 rounded-md overflow-hidden shrink-0 cursor-pointer" onClick={() => { closeDrawer(); router.push(`/shop/fabric/detail/${item.id}`); }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{item.name?.[0] || "?"}</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight cursor-pointer" onClick={() => { closeDrawer(); router.push(`/shop/fabric/detail/${item.id}`); }}>{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{item.type}</p>
                        <p className="text-sm font-bold text-[#A67C3D] mt-2">₹{(item.price || 0).toLocaleString("en-IN")}</p>

                        <button
                          onClick={() => moveToCart(item)}
                          className="mt-2 text-xs font-bold uppercase tracking-wider text-black hover:text-[#A67C3D] transition-colors"
                        >
                          Move to Cart
                        </button>
                      </div>

                      <button onClick={() => removeFromWishlist(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── EMPTY STATE ── */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                    <Info size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-lg">
                    Your {activeDrawerTab === "wishlist" ? "wish list" : "cart"} is empty
                  </p>
                  <button onClick={closeDrawer} className="mt-8 px-8 py-3 bg-black text-white text-sm font-bold rounded-sm hover:bg-gray-800 transition-all tracking-widest uppercase">
                    RETURN TO SHOP
                  </button>
                </div>
              )}
            </div>

            {/* ── STICKY CHECKOUT FOOTER ── */}
            {activeDrawerTab === "cart" && cart.length > 0 && (
              <div className="sticky bottom-0 bg-white p-8 border-t border-gray-100 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 text-xs font-bold tracking-[0.2em] rounded-sm hover:bg-gray-800 transition-all uppercase"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;