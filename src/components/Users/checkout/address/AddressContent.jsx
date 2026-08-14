"use client";
import { useCart } from "@/components/Users/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, CheckCircle, ShieldCheck, CreditCard, Zap, Loader2, Edit2 } from "lucide-react";
import showToast from "@/sharables/toast";
import { paymentApi } from "@/api/payment.api";
import { addressApi } from "@/api/address.api";
import AddressDialog from "@/components/Users/checkout/address/AddressDialog";
import { useAuth } from "@/hooks/Useauth";

const GUEST_ADDRESSES_KEY = "vian_guest_addresses";
const BUY_NOW_KEY = "vian_buy_now";

const readGuestAddresses = () => {
  try {
    const raw = localStorage.getItem(GUEST_ADDRESSES_KEY);
    if (raw) return JSON.parse(raw);

    const legacy = localStorage.getItem("vian_guest_address");
    if (legacy) {
      const addr = JSON.parse(legacy);
      const migrated = [{
        address_id: `guest-${Date.now()}`,
        full_name: addr.fullName || addr.full_name,
        email: addr.email,
        mobile: addr.mobile,
        alternate_mobile: addr.alternateMobile || addr.alternate_mobile || null,
        house_building: addr.house || addr.house_building,
        street_locality: addr.street || addr.street_locality,
        landmark: addr.landmark || null,
        city: addr.city,
        state: addr.state,
        country: addr.country || "India",
        postal_code: addr.postalCode || addr.postal_code,
        address_type: addr.addressType || addr.address_type || "Home",
        is_default: true,
      }];
      localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(migrated));
      localStorage.removeItem("vian_guest_address");
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
};

const writeGuestAddresses = (addresses) => {
  localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(addresses));
};

const AddressContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";

  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [buyNowItems, setBuyNowItems] = useState(null);
  const items = isBuyNow ? buyNowItems : cart;

  useEffect(() => {
    if (!isBuyNow) return;
    try {
      const raw = localStorage.getItem(BUY_NOW_KEY);
      setBuyNowItems(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.error("Failed to load buy-now item", err);
      setBuyNowItems([]);
    }
  }, [isBuyNow]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState("ONLINE");
  const [walletBalance, setWalletBalance] = useState(null);
  const [activeGatewaySetting, setActiveGatewaySetting] = useState("CASHFREE");
  const [selectedOnlineGateway, setSelectedOnlineGateway] = useState("CASHFREE");
  const [enabledGateways, setEnabledGateways] = useState(["CASHFREE"]);

  // Fetch configured payment gateway setting
  useEffect(() => {
    const fetchGatewaySettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/payment/settings`);
        const data = await res.json();
        if (data && data.data && data.data.activeGateway) {
          const gw = data.data.activeGateway.toUpperCase();
          setActiveGatewaySetting(gw);
          
          let enabledList = [];
          if (gw === "BOTH" || gw === "MULTIPLE") {
            enabledList = ["CASHFREE", "ICICI"];
          } else {
            enabledList = gw.split(",").map(s => s.trim());
          }
          setEnabledGateways(enabledList);

          if (enabledList.includes("CASHFREE")) setSelectedOnlineGateway("CASHFREE");
          else if (enabledList.includes("ICICI")) setSelectedOnlineGateway("ICICI");
          else if (enabledList.includes("INSTAMOJO")) setSelectedOnlineGateway("INSTAMOJO");
        }
      } catch (err) {
        console.warn("Could not load payment gateway settings:", err);
      }
    };
    fetchGatewaySettings();
  }, []);

  // Fetch wallet balance if user is logged in
  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem('vian_auth_token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.success) setWalletBalance(parseFloat(data.data?.balance || 0)); })
      .catch(() => {});
  }, [user]);

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const selectedAddress = addresses.find(a => a.address_id === selectedAddressId) || null;

  const loadAddresses = () => {
    if (user) {
      addressApi.getAll().then(res => {
        const list = res.data || [];
        setAddresses(list);
        const preferred = list.find(a => a.is_default) || list[0];
        setSelectedAddressId(preferred?.address_id ?? null);
      });
    } else {
      const list = readGuestAddresses();
      setAddresses(list);
      const preferred = list.find(a => a.is_default) || list[0];
      setSelectedAddressId(preferred?.address_id ?? null);
    }
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totals = (() => {
    const list = items || [];
    let subtotal = 0;
    let gst = 0;
    let stitchingCharge = 0;
    let rtwStitchingCharge = 0;
    let hasCustomItem = false;

    list.forEach((item) => {
      const itemQty = item.quantity || 1;
      const itemSubtotal = item.totalPrice || (item.price * itemQty) || 0;
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

  useEffect(() => {
    if (items !== null && items.length === 0 && currentStep !== 3) {
      if (typeof window !== "undefined") router.replace("/shop/fabric");
    }
  }, [items, router, currentStep]);

  const formatAddress = (addr) =>
    `${addr.house_building}, ${addr.street_locality}, ${addr.city}, ${addr.state} - ${addr.postal_code}, ${addr.country || "India"}`;

  const handleAddressSaved = () => {
    loadAddresses();
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (addressId) => {
    if (user) {
      try {
        await addressApi.remove(addressId);
        loadAddresses();
      } catch (err) {
        showToast.error(err.message || "Failed to delete address.");
      }
    } else {
      const updated = addresses.filter(a => a.address_id !== addressId);
      writeGuestAddresses(updated);
      setAddresses(updated);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(updated.find(a => a.is_default)?.address_id ?? updated[0]?.address_id ?? null);
      }
    }
  };

  const buildOrderPayload = () => ({
    addressId: user ? selectedAddress.address_id : null,
    customer: {
      name: selectedAddress?.full_name || user?.name || user?.username || "Customer",
      email: user?.email || selectedAddress?.email || null,
      phone: selectedAddress?.mobile || user?.mobile || null,
      address: selectedAddress ? formatAddress(selectedAddress) : "Online Order",
    },
    cart: items.map(item => ({
      type: item.type,
      id: item.id || item.pro_id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      size: item.size || null,
      fit: item.fit || null,
      color: item.color || null,
      sleeve: item.sleeve || null,
      isCustom: item.isCustom || false,
      monogram: item.monogram || null,
      customizations: item.customizations || [],
    })),
    totals: {
      subtotal: totals.subtotal,
      shippingFee: totals.shipping,
      grandTotal: totals.grandTotal,
    },
  });

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      showToast.error("Please add or select a delivery address.");
      return;
    }
    if (!items || items.length === 0) return;
    setCurrentStep(2);
    setIsPaymentModalOpen(true);
  };

  const handlePayNow = async () => {
    if (!selectedAddress) {
      showToast.error("Please add or select a delivery address.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    if (paymentMode === "STORE_WALLET") {
      try {
        const token = sessionStorage.getItem('vian_auth_token');
        const orderPayload = buildOrderPayload();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets/checkout`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(orderPayload)
          }
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Wallet checkout failed.');

        if (isBuyNow) localStorage.removeItem(BUY_NOW_KEY);
        else clearCart();

        window.location.href = `/checkout/payment-result?status=success&orderNumber=${data.orderNumber}`;
      } catch (err) {
        showToast.error(err.message || "Wallet payment failed. Please try again.");
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const payload = { ...buildOrderPayload(), paymentMode: "ONLINE", gateway: selectedOnlineGateway };
      const res = await paymentApi.initiate(payload);

      // We must NOT clear the cart immediately for Instamojo because it's a seamless modal on the same page.
      // Clearing the cart here triggers a redirect to /shop/fabric and unmounts this component, breaking the modal.
      if (res.data.gateway !== "INSTAMOJO") {
        if (isBuyNow) {
          localStorage.removeItem(BUY_NOW_KEY);
        } else {
          clearCart();
        }
      }

      if (res.data.gateway === "CASHFREE" && res.data.paymentSessionId) {
        if (!window.Cashfree) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Cashfree checkout script."));
            document.head.appendChild(script);
          });
        }
        const cfMode = (res.data.env || process.env.NEXT_PUBLIC_CASHFREE_ENV || "SANDBOX").toUpperCase() === "PRODUCTION" ? "production" : "sandbox";
        const cashfree = window.Cashfree({ mode: cfMode });
        cashfree.checkout({
          paymentSessionId: res.data.paymentSessionId,
          redirectTarget: "_self"
        });
        return;
      }

      if (res.data.gateway === "INSTAMOJO" && res.data.checkoutUrl) {
        if (!window.Instamojo) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://js.instamojo.com/v1/checkout.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Instamojo checkout script."));
            document.head.appendChild(script);
          });
        }
        
        window.Instamojo.configure({
          handlers: {
            onOpen: function() {},
            onClose: function() {
              showToast.error("Payment cancelled by user.");
              setIsSubmitting(false);
            },
            onSuccess: async function (response) {
              try {
                // Clear cart only after successful payment for Seamless Checkout
                if (isBuyNow) {
                  localStorage.removeItem(BUY_NOW_KEY);
                } else {
                  clearCart();
                }

                const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/instamojo/verify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    merchantTxnNo: res.data.merchantTxnNo,
                    paymentRequestId: response.paymentRequestId || response.payment_request_id || res.data.paymentRequestId,
                    paymentId: response.paymentId || response.payment_id
                  })
                });
                const verifyData = await verifyRes.json();
                
                if (verifyData.success) {
                  window.location.href = `/checkout/payment-result?status=success&orderNumber=${verifyData.data.orderNumber}`;
                } else {
                  throw new Error(verifyData.message || "Payment verification failed");
                }
              } catch (err) {
                showToast.error(err.message || "Payment verification failed. Please try again.");
                setIsSubmitting(false);
                window.location.href = `/checkout/payment-result?status=failed&reason=verification_failed`;
              }
            },
            onFailure: function(response) {
              showToast.error("Payment failed. Please try another method.");
              setIsSubmitting(false);
            }
          }
        });
        window.Instamojo.open(res.data.checkoutUrl);
        return;
      }

      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        throw new Error("No payment URL or session returned from server.");
      }
    } catch (err) {
      showToast.error(err.message || "Could not start payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (items === null) {
    return <div className="bg-[#FAFAF8] min-h-screen py-24 px-4" />;
  }

  return (
    <div className="bg-[#FAFAF8] min-h-screen py-24 px-4 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-center mb-4 tracking-widest">( ORDER SUMMARY )</h1>

        <div className="flex justify-center items-center gap-8 mb-12">
          <StepperStep number={1} label="Order Summary" isActive={currentStep === 1} />
          <StepperStep number={2} label="Payment" isActive={currentStep === 2} />
          <StepperStep number={3} label="Success" isActive={currentStep === 3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800">DELIVERY ADDRESS</h2>
                <button onClick={() => { setEditingAddress(null); setIsAddressDialogOpen(true); }} className="text-sm font-bold text-[#C8A64D] flex items-center gap-1">
                  <Plus size={16}/> ADD NEW ADDRESS
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`bg-[#F5F5F3] p-4 rounded-xl flex justify-between items-start cursor-pointer transition-all ${selectedAddressId === addr.address_id ? 'border-2 border-[#C8A64D]' : 'border-2 border-transparent'}`}>
                        <div className="flex gap-3">
                            <input type="radio" checked={selectedAddressId === addr.address_id} readOnly className="mt-1 accent-[#C8A64D]" />
                            <div>
                                <p className="font-bold flex items-center gap-2 text-gray-900">
                                  {addr.full_name}
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">{addr.address_type}</span>
                                  {Boolean(Number(addr.is_default)) && <span className="text-xs px-2 py-0.5 bg-[#F5F0E1] text-[#C8A64D] rounded-full font-bold">DEFAULT</span>}
                                </p>
                                <p className="text-sm text-gray-600">{formatAddress(addr)}</p>
                                <p className="text-sm text-gray-600">Mobile: {addr.mobile}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(addr);
                              setIsAddressDialogOpen(true);
                            }}
                            className="text-gray-400 hover:text-[#C8A64D] transition p-1"
                            title="Edit Address"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.address_id); }}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Delete Address"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Please add a delivery address to proceed.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h2 className="font-bold mb-4 text-gray-800">ORDERED PRODUCTS</h2>
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={item.cartItemId || `${item.id}-${i}`} className="flex gap-4 bg-[#F5F5F3] p-4 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.shortDesc || "Premium fabric"}</p>
                      
                      {item.type === 'fabric' && <p className="text-sm font-semibold text-[#C8A64D] mt-2">LENGTH: {item.quantity} METER</p>}
                      
                      {/* NEW RTW, MADE-TO-WEAR, AND BESPOKE UI */}
                      {['rtw', 'made-to-wear', 'bespoke'].includes(item.type) && (item.size || item.fit) && (
                        <p className="text-sm font-semibold text-[#C8A64D] mt-2">
                          {item.size && `SIZE: ${item.size}`}
                          {item.size && item.fit && "  •  "}
                          {item.fit && `FIT: ${item.fit}`}
                        </p>
                      )}
                      
                      {/* Renders Custom Measurements & Selections perfectly */}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-[#C8A64D]/30 flex flex-col gap-1">
                          {item.customizations.map((cust, idx) => (
                            <p key={idx} className="text-[0.6875rem] text-gray-600 capitalize">
                              <span className="font-semibold text-gray-800">{cust.type}:</span> {cust.name}
                            </p>
                          ))}
                        </div>
                      )}

                      <p className="font-bold mt-2 text-gray-900">Rs. {item.price.toLocaleString("en-IN")}/-</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500">QTY: {item.type === 'fabric' ? 1 : item.quantity}</p>
                      <p className="text-gray-500 mt-1">Delivery by Tue, Jul 28</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit sticky top-24">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-sm font-bold border-b border-[#C8A64D] text-gray-800 pb-2 mb-4">PRICE DETAILS</h3>
              <div className="space-y-3 text-sm">
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
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">TOTAL AMOUNT</span>
                <span className="font-bold text-gray-900">Rs. {totals.grandTotal.toLocaleString("en-IN")}/-</span>
              </div>
                <button
                  onClick={handleContinueToPayment}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-[#C8A64D] text-white font-bold py-3.5 px-6 rounded-full hover:bg-[#b8974a] transition-all shadow-md shadow-[#C8A64D]/20 text-sm tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  MAKE PAYMENT →
                </button>
              </div>
            </div>
          </div>

          {/* LUXURY PAYMENT SELECTION POPUP MODAL */}
          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-[100005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 transform transition-all scale-100 p-6 relative">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#C8A64D]/30 text-[#C8A64D]">
                      <CreditCard size={22} />
                    </span>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-900 tracking-wide">SELECT PAYMENT METHOD</h3>
                      <p className="text-xs text-slate-500 font-sans">Choose your option to complete this order</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsPaymentModalOpen(false); setCurrentStep(1); }}
                    disabled={isSubmitting}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Order Amount Banner */}
                <div className="mt-4 bg-[#FDFBF7] border border-[#C8A64D]/20 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Payable Amount:</span>
                  <span className="text-lg font-bold text-slate-900">Rs. {totals.grandTotal.toLocaleString("en-IN")}/-</span>
                </div>

                {/* Payment Options Grid */}
                <div className="space-y-3.5 my-5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("ONLINE")}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between gap-3 ${
                      paymentMode === "ONLINE"
                        ? "border-[#C8A64D] bg-[#FDFBF7] text-slate-900 shadow-md ring-2 ring-[#C8A64D]/20"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">Pay Online</span>
                        <span className="text-[0.625rem] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                          Recommended
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-normal leading-relaxed block mt-1">
                        UPI (Google Pay, PhonePe), Credit/Debit Cards, Netbanking &amp; Wallets
                      </span>
                      <div className="text-[0.6875rem] text-[#C8A64D] font-semibold flex items-center gap-1.5 mt-2.5">
                        <ShieldCheck size={14} className="text-[#C8A64D]" />
                        100% Encrypted Bank Gateway
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMode === "ONLINE" ? "border-[#C8A64D] bg-[#C8A64D] text-white" : "border-gray-300"
                    }`}>
                      {paymentMode === "ONLINE" && <CheckCircle size={14} className="fill-current text-white" />}
                    </div>
                  </button>

                  {/* Gateway Provider Selection when Multiple are active */}
                  {paymentMode === "ONLINE" && enabledGateways.length > 1 && (
                    <div className="ml-2 pl-3.5 sm:ml-3 sm:pl-4 border-l-2 border-[#C8A64D]/60 space-y-2.5 pt-1 pb-1 animate-fade-in">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span>Choose Payment Provider:</span>
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {enabledGateways.includes("CASHFREE") && (
                          <div
                            onClick={() => setSelectedOnlineGateway("CASHFREE")}
                            className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center justify-between ${
                              selectedOnlineGateway === "CASHFREE"
                                ? "border-[#C8A64D] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C8A64D]/20"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                                <Zap size={14} className="text-emerald-600" />
                                <span>Cashfree</span>
                              </div>
                              <p className="text-[0.625rem] text-gray-500 mt-1">UPI, Cards &amp; Netbanking</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              selectedOnlineGateway === "CASHFREE" ? "border-[#C8A64D] bg-[#C8A64D]" : "border-gray-300 bg-white"
                            }`}>
                              {selectedOnlineGateway === "CASHFREE" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        )}

                        {enabledGateways.includes("ICICI") && (
                          <div
                            onClick={() => setSelectedOnlineGateway("ICICI")}
                            className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center justify-between ${
                              selectedOnlineGateway === "ICICI"
                                ? "border-[#C8A64D] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C8A64D]/20"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                                <ShieldCheck size={14} className="text-blue-600" />
                                <span>ICICI Gateway</span>
                              </div>
                              <p className="text-[0.625rem] text-gray-500 mt-1">ICICI Bank E-Commerce</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              selectedOnlineGateway === "ICICI" ? "border-[#C8A64D] bg-[#C8A64D]" : "border-gray-300 bg-white"
                            }`}>
                              {selectedOnlineGateway === "ICICI" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        )}

                        {enabledGateways.includes("INSTAMOJO") && (
                          <div
                            onClick={() => setSelectedOnlineGateway("INSTAMOJO")}
                            className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center justify-between ${
                              selectedOnlineGateway === "INSTAMOJO"
                                ? "border-[#C8A64D] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C8A64D]/20"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                                <Zap size={14} className="text-purple-600" />
                                <span>Instamojo</span>
                              </div>
                              <p className="text-[0.625rem] text-gray-500 mt-1">Seamless Checkout</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              selectedOnlineGateway === "INSTAMOJO" ? "border-[#C8A64D] bg-[#C8A64D]" : "border-gray-300 bg-white"
                            }`}>
                              {selectedOnlineGateway === "INSTAMOJO" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Store Wallet Option */}
                  {user && walletBalance !== null && (
                    <button
                      type="button"
                      onClick={() => setPaymentMode("STORE_WALLET")}
                      disabled={walletBalance < totals.grandTotal || isSubmitting}
                      className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between gap-3 ${
                        paymentMode === "STORE_WALLET"
                          ? "border-[#C8A64D] bg-[#FDFBF7] text-slate-900 shadow-md ring-2 ring-[#C8A64D]/20"
                          : walletBalance < totals.grandTotal
                          ? "border-gray-200 text-gray-400 bg-gray-50/70 cursor-not-allowed opacity-70"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mr-2">
                          <span className="font-bold text-base text-slate-900">My Store Wallet</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            walletBalance >= totals.grandTotal ? 'bg-amber-50 text-[#C8A64D] border-amber-200/60' : 'bg-rose-50 text-rose-600 border-rose-200/60'
                          }`}>
                            ₹{walletBalance.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-normal leading-relaxed block mt-1">
                          Instant checkout using available account store credits
                        </span>
                        <div className="text-[0.6875rem] text-slate-500 font-medium mt-2 flex items-center gap-1">
                          {walletBalance < totals.grandTotal ? "❌ Insufficient balance for this order" : "✅ Available for instant checkout"}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMode === "STORE_WALLET" ? "border-[#C8A64D] bg-[#C8A64D] text-white" : "border-gray-300"
                      }`}>
                        {paymentMode === "STORE_WALLET" && <CheckCircle size={14} className="fill-current text-white" />}
                      </div>
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isSubmitting || (paymentMode === "STORE_WALLET" && walletBalance < totals.grandTotal)}
                    className="w-full bg-[#C8A64D] text-white font-bold py-3.5 px-6 rounded-full hover:bg-[#b8974a] transition-all shadow-lg shadow-[#C8A64D]/25 disabled:opacity-50 text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? (paymentMode === "STORE_WALLET" ? "Processing Order..." : "Redirecting to Payment...")
                      : `Pay Rs. ${totals.grandTotal.toLocaleString("en-IN")}/- Now →`
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsPaymentModalOpen(false); setCurrentStep(1); }}
                    disabled={isSubmitting}
                    className="w-full text-slate-500 hover:text-slate-700 font-semibold py-2 text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          )}

        <AddressDialog
          open={isAddressDialogOpen}
          onClose={() => { setIsAddressDialogOpen(false); setEditingAddress(null); }}
          onAddressSaved={handleAddressSaved}
          initialData={editingAddress}
        />
      </div>
    </div>
  );
};

const StepperStep = ({ number, label, isActive }) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-[#C8A64D] text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
      {number}
    </div>
    <span className={`uppercase tracking-widest text-xs ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const SummaryRow = ({ label, value, isFree, isIncluded }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}</span>
    {isFree ? (
      <span className="text-green-600 font-bold text-xs tracking-wide bg-green-50 px-2.5 py-1 rounded-full">FREE</span>
    ) : isIncluded ? (
      <span className="text-emerald-700 font-bold text-xs tracking-wide bg-emerald-50 px-2.5 py-1 rounded-full">
        {value !== null && value !== undefined ? `Rs. ${Number(value).toLocaleString("en-IN")}/- (INCLUDED)` : "INCLUDED"}
      </span>
    ) : (
      <span className="text-gray-800 font-medium">Rs. {(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</span>
    )}
  </div>
);

export default AddressContent;