'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderApi } from '@/api/order.api';
import { ShoppingBag, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const ProfileOrders = ({ compact = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getUserOrders();
        if (res && res.success) {
          setOrders(res.data || []);
        } else {
          setError(res.message || "Could not load your orders.");
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
        setError("Could not load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const formatDate = (dateString) => {
    const date = parseBackendDate(dateString);
    if (!date || isNaN(date)) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getExpectedDelivery = (dateString) => {
    const date = parseBackendDate(dateString);
    if (!date || isNaN(date)) return 'N/A';
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'cancelled':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'delivered':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'shipped':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'processing':
        return 'text-[#C8A64D] bg-[#C8A64D]/10 border-[#C8A64D]/20';
      default:
        return 'text-slate-300 bg-white/5 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#F9F7F2] rounded-2xl border border-black/10 ${compact ? 'p-6 h-full' : 'min-h-[25rem] shadow-sm'} flex items-center justify-center`}>
        <div className="w-8 h-8 border-4 border-[#C8A64D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#F9F7F2] rounded-2xl border border-black/10 p-8 text-center ${compact ? 'h-full' : 'min-h-[25rem] shadow-sm'} flex flex-col items-center justify-center`}>
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`bg-[#F9F7F2] rounded-2xl border border-black/10 ${compact ? 'p-6 h-full' : 'min-h-[25rem] shadow-sm'} flex flex-col items-center justify-center`}>
        <ShoppingBag className="w-10 h-10 text-[#C8A64D] mb-3" />
        <p className="text-black/50 font-medium text-sm mb-4">No orders found.</p>
        <Link
          href="/shop"
          className="text-xs font-bold text-[#C8A64D] border-b border-[#C8A64D] pb-0.5 hover:text-black hover:border-black transition-colors"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  // Compact list view — matches the screenshot's "Your Orders" card
  if (compact) {
    const preview = orders.slice(0, 4);
    return (
      <div className="bg-[#F9F7F2] border border-black/10 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-black tracking-wide">Your Orders</h3>
          <Link
            href="/profile/orders"
            className="text-xs font-bold text-[#C8A64D] border-b border-[#C8A64D] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-black/5">
          {preview.map((order) => {
            const item = order.items?.[0];
            const itemCount = order.items?.length || 0;
            return (
              <div
                key={order.order_id}
                className="flex items-center gap-2 sm:gap-3 py-3.5 group"
              >
                <Link
                  href={`/profile/orders/${order.order_number}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="relative w-11 h-14 rounded-md overflow-hidden bg-black/5 border border-black/5 shrink-0">
                    {item?.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/30 text-[0.5625rem]">No img</div>
                    )}
                    {itemCount > 1 && (
                      <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-black text-white text-[0.5625rem] font-bold flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </div>

                  <p className="flex-1 text-[0.8125rem] font-medium text-black leading-snug truncate group-hover:text-[#C8A64D] transition">
                    {item?.product_name || 'Order item'}
                  </p>
                </Link>

                {(order.order_status || '').toUpperCase() !== 'CANCELLED' && (
                  <a
                    href={`${API_URL}/api/orders/${order.order_id || order.order_number}/invoice/download`}
                    download
                    className="px-2 py-1.5 bg-[#C8A64D]/15 hover:bg-[#C8A64D] text-[#C8A64D] hover:text-white rounded flex items-center gap-1 text-[0.625rem] font-bold uppercase transition shrink-0"
                    title="Download Invoice"
                  >
                    <Download size={12} />
                    <span>Invoice</span>
                  </a>
                )}

                <Link href={`/profile/orders/${order.order_number}`} className="shrink-0 p-1 text-black/30 group-hover:text-black/60 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Original full grid view — unchanged, still usable elsewhere (e.g. /profile/orders)
  return (
    <div className="w-full">
      <h2 className="text-center font-serif text-3xl sm:text-4xl text-[#C8A64D] uppercase tracking-widest mb-10">
        Your Orders
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const mainItem = order.items && order.items.length > 0 ? order.items[0] : null;

          return (
            <div
              key={order.order_id}
              className="bg-white border border-black/10 hover:border-black/20 transition-colors rounded-xl overflow-hidden flex flex-col shadow-sm"
            >
              <div className="p-5 flex gap-4 h-[7.5rem]">
                {mainItem ? (
                  <>
                    <div className="w-20 h-24 bg-black/5 rounded-md overflow-hidden shrink-0 border border-black/5">
                      {mainItem.product_image ? (
                        <img
                          src={mainItem.product_image}
                          alt={mainItem.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/40 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <h3 className="text-black text-xs font-semibold uppercase tracking-wider mb-2 truncate">
                        {mainItem.product_name}
                      </h3>
                      {mainItem.fit_style && (
                        <p className="text-[0.625rem] text-black/60 mb-1">
                          Fit Style: <span className="text-black font-medium">{mainItem.fit_style}</span>
                        </p>
                      )}
                      {mainItem.selected_size && (
                        <p className="text-[0.625rem] text-black/60 mb-1 flex items-center gap-1.5">
                          <span className="w-3 h-3 border border-black/20 rounded flex items-center justify-center text-[0.5rem] bg-black/5 text-black font-medium">{mainItem.selected_size}</span>
                        </p>
                      )}
                      {mainItem.product_type === 'fabric' && mainItem.selected_meter && (
                        <p className="text-[0.625rem] text-black/60 mb-1">
                          {mainItem.selected_meter} Meters
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col justify-center text-black/40 text-xs italic">
                    Order items unavailable
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <div className="flex justify-between items-start mb-4 text-[0.625rem]">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-black/50 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="text-black font-bold">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-black/50 uppercase tracking-widest mb-1">Ordered On</p>
                      <p className="text-black font-bold">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <p className="text-black/50 uppercase tracking-widest mb-1">Expected Delivery</p>
                    <p className="text-black font-bold">{getExpectedDelivery(order.created_at)}</p>
                  </div>
                </div>

                <div className={`w-full py-2.5 px-3 rounded text-center text-[0.625rem] font-bold tracking-widest uppercase border ${getStatusClasses(order.order_status)} mb-4`}>
                  Order {order.order_status}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/profile/orders/${order.order_number}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-black/15 hover:bg-black/5 transition text-black text-[0.625rem] font-bold tracking-widest uppercase rounded cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Details
                  </Link>
                  {(order.order_status || '').toUpperCase() !== 'CANCELLED' && (
                    <a
                      href={`${API_URL}/api/orders/${order.order_id || order.order_number}/invoice/download`}
                      download
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#C8A64D] hover:bg-black text-white transition text-[0.625rem] font-bold tracking-widest uppercase rounded cursor-pointer shadow-xs"
                      title="Download Invoice PDF"
                    >
                      <Download size={13} />
                      Invoice
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileOrders;