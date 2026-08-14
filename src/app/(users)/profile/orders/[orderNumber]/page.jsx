"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { orderApi } from "@/api/order.api";
import { ChevronRight, ExternalLink, Download, Printer } from "lucide-react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refundDialog, setRefundDialog] = useState(null); // null | 'wallet' | 'gateway'

  const fetchOrderDetails = async () => {
    try {
      const myOrdersRes = await orderApi.getUserOrders();
      let fullOrder = null;
      
      if (myOrdersRes && myOrdersRes.success) {
        fullOrder = myOrdersRes.data.find(o => o.order_number === orderNumber);
      }
      
      if (!fullOrder) {
        setError("Order not found.");
        setLoading(false);
        return;
      }
      setOrder(fullOrder);

      // Fetch Tracking
      try {
        const trackRes = await orderApi.getTracking(fullOrder.order_id);
        if (trackRes && trackRes.success) {
          setTracking(trackRes.data);
        }
      } catch (trackErr) {
        console.log("Tracking not available yet", trackErr);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError("Could not load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  // Wallet-paid: payment_mode is explicitly STORE_WALLET (set by walletCheckout)
  const isWalletPaid = order && (order.payment_mode === 'STORE_WALLET' || order.gateway_name === 'STORE_WALLET');

  // Gateway-paid: any successful payment that is NOT a store wallet payment
  const isGatewayPaid = order && order.payment_status === 'Success' && !isWalletPaid;

  const getPaymentMethodLabel = (ord) => {
    if (!ord) return 'Online';
    if (ord.payment_mode === 'STORE_WALLET' || ord.gateway_name === 'STORE_WALLET') {
      return 'Store Wallet';
    }
    const mode = ord.payment_mode || ord.payment_method;
    if (!mode) return 'Online';
    switch (mode.toUpperCase()) {
      case 'CARD':
        return ord.card_network ? `Card (${ord.card_network})` : 'Card';
      case 'NB':
      case 'NET_BANKING':
        return 'Net Banking';
      case 'UPI':
        return 'UPI';
      case 'WALLET':
        return 'Online Wallet';
      case 'STORE_WALLET':
        return 'Store Wallet';
      default:
        return mode;
    }
  };

  const getRefundDestination = (ord) => {
    if (!ord) return '—';
    const isWallet = ord.payment_mode === 'STORE_WALLET' || ord.gateway_name === 'STORE_WALLET';
    if (ord.refund_method === 'WALLET' || ord.refund_method === 'wallet' || isWallet) {
      return 'Store Wallet';
    }
    if (ord.refund_method === 'GATEWAY' || ord.refund_method === 'gateway') {
      return `Original Method (${getPaymentMethodLabel(ord)})`;
    }
    return isWallet ? 'Store Wallet' : `Original Method (${getPaymentMethodLabel(ord)})`;
  };

  const handleCancelClick = () => {
    if (isWalletPaid) {
      // Wallet paid — show wallet-only caution dialog
      setRefundDialog('wallet');
    } else if (isGatewayPaid) {
      // Gateway paid — ask user where they want the refund
      setRefundDialog('gateway');
    } else {
      // No payment or pending — cancel without any refund
      if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
      doCancelOrder(null);
    }
  };

  const doCancelOrder = async (refundMethod) => {
    setRefundDialog(null);
    setCancelLoading(true);
    try {
      await orderApi.cancelOrder(order.order_id, refundMethod);
      await fetchOrderDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const parseBackendDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString !== 'string') return new Date(dateString);
    
    const parts = dateString.split(/[\s-:]/); 
    if (parts.length === 7) {
      const [day, month, year, h, m, s, ampm] = parts;
      let hours = parseInt(h, 10);
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const isoString = `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${m}:${s}`;
      return new Date(isoString);
    }
    
    return new Date(dateString.replace(' ', 'T'));
  };

  const formatDate = (dateValue, includeTime = false) => {
    if (!dateValue) return 'N/A';
    
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      date = parseBackendDate(dateValue);
    }
    if (!date || isNaN(date)) return 'N/A';
    if (includeTime) {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ', ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ececea] flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-[#C8A64D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#ececea] flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Order not found"}</p>
          <Link href="/profile" className="text-[#C8A64D] hover:underline uppercase text-sm font-bold tracking-widest">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'cancelled':
        return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'delivered':
        return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      case 'shipped':
        return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
      case 'processing':
        return 'text-[#C8A64D] border-[#C8A64D]/20 bg-[#C8A64D]/5';
      default:
        return 'text-black/70 border-white/20 bg-black/5';
    }
  };

  const expectedDelivery = parseBackendDate(order.created_at);
  expectedDelivery.setDate(expectedDelivery.getDate() + 5);

  const blockClass = "bg-white border border-black/10 rounded-xl p-5 mb-5";
  const sectionTitleClass = "text-[0.625rem] sm:text-xs font-bold text-[#C8A64D] uppercase tracking-widest mb-4";

  return (
    <div className="min-h-screen bg-[#ececea] pt-28 md:pt-36 pb-16 px-4 sm:px-6 md:px-12 lg:px-16 text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-[0.5625rem] sm:text-[0.625rem] text-black/50 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link href="/profile" className="hover:text-black transition">Profile</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link href="/profile" className="hover:text-black transition">Your Orders</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-[#C8A64D]">{order.order_number}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider mb-2 leading-none">
              Order {order.order_number}
            </h1>
            <p className="text-black/60 text-xs">
              Placed on {formatDate(order.created_at, true)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {(order.order_status || '').toUpperCase() !== 'CANCELLED' && (
                <>
                  <button
                    onClick={() => window.open(`${API_URL}/api/orders/${order.order_id || order.order_number}/invoice/print`, '_blank')}
                    className="px-3 py-1.5 bg-white border border-black/20 hover:bg-black/5 text-black text-[0.625rem] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 transition"
                    title="Print Invoice"
                  >
                    <Printer size={13} />
                    <span>Print Invoice</span>
                  </button>
                  <a
                    href={`${API_URL}/api/orders/${order.order_id || order.order_number}/invoice/download`}
                    download
                    className="px-3 py-1.5 bg-[#C8A64D] hover:bg-black text-white text-[0.625rem] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 transition shadow-sm"
                    title="Download Invoice"
                  >
                    <Download size={13} />
                    <span>Download Invoice</span>
                  </a>
                </>
              )}
              <div className={`px-4 py-1.5 rounded-full border text-[0.625rem] font-bold uppercase tracking-widest ${getStatusClasses(order.order_status)}`}>
                Status: {order.order_status}
              </div>
            </div>
            {/* Show cancel button if order is not delivered, cancelled, on the way, or out for delivery */}
            {!['CANCELLED', 'DELIVERED', 'ON_THE_WAY', 'OUT_FOR_DELIVERY'].includes((order.order_status || '').toUpperCase()) && (
              <button 
                onClick={handleCancelClick}
                disabled={cancelLoading}
                className="text-[0.625rem] uppercase font-bold tracking-widest text-red-500 hover:text-white border border-red-500 hover:bg-red-500 transition-colors px-3 py-1.5 rounded disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            {refundDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
                  <div className="bg-red-50 border-b border-red-100 px-6 py-4">
                    <h3 className="font-bold text-base text-red-700 uppercase tracking-wider">Cancel Order</h3>
                    <p className="text-xs text-red-500 mt-1">This action cannot be undone.</p>
                  </div>
                  <div className="px-6 py-5">
                    {refundDialog === 'wallet' ? (
                      <>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">⚠ Caution — Wallet Payment</p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            This order was paid using your Store Wallet. Upon cancellation, the full amount will be refunded back to your wallet instantly.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setRefundDialog(null)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition">
                            Go Back
                          </button>
                          <button onClick={() => doCancelOrder('WALLET')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition">
                            Cancel & Refund to Wallet
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                          Where would you like the refund of <strong>₹{order?.grand_total}</strong> to be credited?
                        </p>
                        <div className="space-y-3 mb-5">
                          <button onClick={() => doCancelOrder('WALLET')} className="w-full border-2 border-[#C8A64D] bg-[#F5F0E1] text-[#C8A64D] py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#C8A64D] hover:text-white transition text-left px-4">
                            💰 Refund to My Wallet
                            <span className="block font-normal text-[0.625rem] mt-0.5 opacity-70">Credited instantly to your store wallet</span>
                          </button>
                          <button onClick={() => doCancelOrder('GATEWAY')} className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-gray-400 transition text-left px-4">
                            🏦 Refund to Original Payment Method
                            <span className="block font-normal text-[0.625rem] mt-0.5 opacity-70">3–7 business days via ICICI Bank gateway</span>
                          </button>
                        </div>
                        <button onClick={() => setRefundDialog(null)} className="w-full text-gray-400 text-xs hover:text-gray-600 transition">
                          ← Back
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left Column (Items & Tracking) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* Items Block */}
            <div>
              <h2 className="text-[0.6875rem] sm:text-xs font-bold text-black uppercase tracking-widest mb-3 px-1">
                Items in this Order
              </h2>
              <div className="space-y-4">
                {order.items && order.items.map((item) => (
                  <div key={item.item_id} className={`${blockClass} !mb-0 flex gap-4 md:gap-6`}>
                    <div className="w-20 sm:w-24 h-24 sm:h-28 bg-black/5 rounded overflow-hidden shrink-0">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">
                        {item.product_name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-black/60 mb-2">
                        {item.fit_style && <p>Fit Style: <span className="text-black">{item.fit_style}</span></p>}
                        {item.selected_size && <p>Size: <span className="text-black">{item.selected_size}</span></p>}
                        {item.product_type === 'fabric' && item.selected_meter && <p>Meter: <span className="text-black">{item.selected_meter}</span></p>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#C8A64D]">
                          <span className="text-black/50 mr-1">Quantity:</span> {item.quantity}
                        </span>
                      </div>
                      {item.monogram_enabled && (
                        <div className="mt-3 pt-2 border-t border-dashed border-black/10 text-xs text-black/70 grid grid-cols-2 gap-2">
                          <p className="col-span-2 font-bold text-[#C8A64D] tracking-wide">MONOGRAM CUSTOMIZATION (+₹{Number(item.monogram_price || 0).toFixed(2)})</p>
                          <p>Initials: <span className="text-black font-serif font-bold tracking-widest uppercase">&ldquo;{item.monogram_text ? item.monogram_text.split(' (')[0] : ''}&rdquo;</span></p>
                          {item.monogram_placement_name && <p>Placement: <span className="text-black">{item.monogram_placement_name}</span></p>}
                          {item.monogram_color_name && <p>Color: <span className="text-black">{item.monogram_color_name}</span></p>}
                          {item.monogram_font_name && <p>Font: <span className="text-black">{item.monogram_font_name}</span></p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Block */}
            <div id="tracking" className={`${blockClass} flex-1`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={sectionTitleClass + " !mb-0"}>Delivery Tracking</h2>
                {tracking && tracking.shipment?.awb_number && (
                  <a 
                    href={`https://www.delhivery.com/tracking?id=${tracking.shipment.awb_number}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[0.625rem] text-[#C8A64D] hover:text-black transition flex items-center gap-1 uppercase tracking-widest"
                  >
                    Live Tracking Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {tracking ? (
                <div className="text-xs space-y-6 relative pl-6">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[0.4375rem] w-px bg-black/10" />

                  {/* Order Placed (Local Synthetic Scan) */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#C8A64D]" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                      <span className="font-bold text-black uppercase tracking-wider">Order Placed</span>
                      <span className="text-[0.625rem] text-black/50">{formatDate(order.created_at, true)}</span>
                    </div>
                    <p className="text-black/60 text-[0.6875rem] font-sans">Order successfully created and payment verified.</p>
                  </div>

                  {tracking?.tracking?.scans && tracking.tracking.scans.length > 0 ? (
                    tracking.tracking.scans.map((scan, i) => {
                      const isLast = i === 0; // scans are descending
                      const isError = scan.status.toLowerCase().includes('cancel') || scan.status.toLowerCase().includes('fail');
                      const dotColor = isError ? 'bg-red-500' : (isLast ? 'bg-[#C8A64D]' : 'bg-slate-500');
                      
                      return (
                        <div key={i} className="relative">
                          <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${dotColor}`} />
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                            <span className={`font-bold uppercase tracking-wider ${isError ? 'text-red-500' : 'text-black'}`}>
                              {scan.status}
                            </span>
                            <span className="text-[0.625rem] text-black/50">{formatDate(scan.date, true)}</span>
                          </div>
                          <p className={`text-[0.6875rem] font-sans ${isError ? 'text-red-500' : 'text-black/60'}`}>
                            {scan.instructions || scan.location}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#C8A64D]" />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                        <span className="font-bold text-black uppercase tracking-wider">Seller Preparing Your Order</span>
                      </div>
                      <p className="text-black/60 text-[0.6875rem] font-sans">Seller has packaged your order and prepared shipment.</p>
                    </div>
                  )}

                  {(order.order_status || '').toUpperCase() === 'CANCELLED' && (
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-500" />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                        <span className="font-bold text-red-500 uppercase tracking-wider">Cancelled</span>
                      </div>
                      <p className="text-red-500 text-[0.6875rem] font-sans">Order cancelled.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-black/60 flex flex-col gap-4">
                  <p>Tracking information is currently unavailable.</p>
                  <p className="text-[0.625rem]">Tracking details typically appear within 24 hours of placing the order.</p>
                </div>
              )}
            </div>
            
          </div>

          {/* Right Column (Summary & Details) */}
          <div className="lg:col-span-1 flex flex-col">
            
            <div className={blockClass}>
              <h2 className={sectionTitleClass}>Summary</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60">Grand Total</span>
                  <span className="text-black font-bold">Rs. {order.grand_total}/-</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60">Expected Delivery</span>
                  <span className="text-black font-medium">{formatDate(expectedDelivery)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Refund Status</span>
                  <span className={`text-[0.625rem] font-bold uppercase ${(order.order_status || '').toUpperCase() === 'CANCELLED' ? 'text-red-500' : 'text-black/50'}`}>
                    {(order.order_status || '').toUpperCase() === 'CANCELLED' ? 'Refunded' : 'N/A'}
                  </span>
                </div>
                {(order.order_status || '').toUpperCase() === 'CANCELLED' && (
                  <div className="flex justify-between items-center pt-2 border-t border-black/10">
                    <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Refunded To</span>
                    <span className="text-black font-bold text-[0.6875rem] text-right">
                      {getRefundDestination(order)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={blockClass}>
              <h2 className={sectionTitleClass}>Shipping Address</h2>
              <div className="text-xs text-black/70 font-sans leading-relaxed">
                <p className="text-black font-bold text-sm mb-1 uppercase tracking-wider">{order.customer_name}</p>
                <p className="mb-3 text-black/60 text-[0.625rem]">Phone: {order.customer_mobile}</p>
                <p>{order.shipping_address}</p>
              </div>
            </div>

            <div className={blockClass}>
              <h2 className={sectionTitleClass}>Payment Details</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Payment Method</span>
                  <span className="text-black font-medium">{getPaymentMethodLabel(order)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Payment Gateway</span>
                  <span className="text-black font-medium">
                    {order.gateway_name === 'CASHFREE' ? '⚡ Cashfree' : order.gateway_name === 'ICICI_BANK' || order.gateway_name === 'ICICI' ? '🏛️ ICICI Bank' : order.gateway_name === 'STORE_WALLET' ? 'Store Wallet' : (order.gateway_name || '—')}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Amount Paid</span>
                  <span className="text-black">₹{order.grand_total}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Payment Status</span>
                  <span className={`text-[0.625rem] font-bold uppercase tracking-wider ${order.payment_status === 'Success' ? 'text-emerald-500' : 'text-[#C8A64D]'}`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`${blockClass} !mb-0`}>
              <h2 className={sectionTitleClass}>Delivery Details</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">Courier</span>
                  <span className="text-black">{tracking?.shipment ? 'Delhivery' : 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/60 uppercase text-[0.625rem] tracking-wider">AWB Number</span>
                  <span className="text-black">{tracking?.shipment?.awb_number || 'Pending'}</span>
                </div>
                <div className="pt-2">

                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}