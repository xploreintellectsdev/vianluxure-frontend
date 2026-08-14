import React, { useState, useEffect, useCallback } from 'react';
import {
    X, User, Calendar, CreditCard, Truck, Ruler, Shirt, FileText, PackageSearch, RefreshCw, ExternalLink, PlusCircle, CheckCircle, Clock, Printer, Download, Sparkles
} from 'lucide-react';
import { orderApi } from '@/api/order.api';
import showToast from '@/sharables/toast';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// order_items.product_image / product_name are stored as a full absolute
// URL at checkout time, but custom_options.option_image (collar/pocket/
// sleeve/button) is stored as a bare "/uploads/..." path — same convention
// used everywhere else in the admin panel (see rtw.columns.js etc).
const resolveImage = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    return `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

const PRODUCT_TYPE_LABELS = {
    fabric: 'FABRIC',
    rtw: 'READY TO WEAR',
    'made-to-wear': 'MADE TO WEAR',
    bespoke: 'BESPOKE',
};

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

// Bespoke stores its manual measurement fields as regular
// order_bespoke_selections rows (option_type = 'chest', 'waist', etc, with
// option_name holding the entered value as text) alongside the collar/
// pocket/sleeve/button picks — they were being saved correctly all along,
// the admin modal just never rendered them. This maps each measurement
// option_type to its display label.
const MEASUREMENT_FIELDS = [
    { type: 'chest', label: 'Chest' },
    { type: 'length', label: 'Length' },
    { type: 'shoulders', label: 'Shoulders' },
    { type: 'sleeve length', label: 'Sleeve Length' },
    { type: 'neck', label: 'Neck' },
    { type: 'waist', label: 'Waist' },
    { type: 'hips', label: 'Hips' },
    { type: 'biceps', label: 'Biceps' },
    { type: 'left wrist', label: 'Left Wrist' },
    { type: 'right wrist', label: 'Right Wrist' },
];

// Case/whitespace-insensitive so a stray "Sleeve " or "SLEEVE" saved from
// an older cart payload still matches instead of silently showing blank.
const normalizeType = (t) => (t || '').trim().toLowerCase();

/**
 * Best-effort split of the flat `shipping_address` text into city/state/
 * postal-code pieces for guest orders (no user_addresses row to join
 * against). Registered-user orders get real structured fields from the
 * backend instead of going through this — see `deliveryInfo` below.
 */
const parseFreeformAddress = (raw) => {
    if (!raw) return { city: null, state: null, postalCode: null };
    const postalMatch = raw.match(/\b(\d{6})\b/);
    const postalCode = postalMatch ? postalMatch[1] : null;
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    // e.g. "..., asdjbaksd, SAJDBJSADBH - 123456, India" -> state segment
    // is the one containing the postal code (or the second-to-last part).
    let state = null;
    const stateSegment = parts.find((p) => postalCode && p.includes(postalCode));
    if (stateSegment) {
        state = stateSegment.replace(postalCode, '').replace('-', '').trim();
    } else if (parts.length >= 2) {
        state = parts[parts.length - 2];
    }
    const city = parts.length >= 3 ? parts[parts.length - 3] : parts[0] || null;
    return { city, state, postalCode };
};

function InfoRow({ label, value, className = '' }) {
    return (
        <div className={className}>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
            <div className="text-sm font-medium text-slate-800">{value ?? '—'}</div>
        </div>
    );
}

function SectionCard({ icon: Icon, title, children }) {
    return (
        <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-[#C8A64D]">
                <Icon size={16} />
                <h3 className="text-sm font-serif font-semibold tracking-wide">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function DesignTile({ label, item }) {
    const img = resolveImage(item?.image);
    return (
        <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50">
            <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={item?.name || label} className="w-full h-full object-cover" />
                ) : (
                    <Shirt size={28} className="text-slate-300" />
                )}
            </div>
            <div className="p-2">
                <p className="text-[0.625rem] uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800 truncate">{item?.name || '—'}</p>
                {item?.price != null && item.price !== '' && (
                    <p className="text-xs font-semibold text-[#C8A64D]">₹{Number(item.price).toFixed(0)}</p>
                )}
            </div>
        </div>
    );
}

/**
 * One order's line item, rendered according to ITS OWN product_type — not
 * the order as a whole — since a single order can legitimately mix fabric,
 * rtw, made-to-wear and bespoke items in one cart.
 */
function OrderItemCard({ item }) {
    const isGarment = item.product_type === 'made-to-wear' || item.product_type === 'bespoke';
    const isBespoke = item.product_type === 'bespoke';

    const selections = item.design_selections || [];
    const byType = (type) => selections.find((s) => normalizeType(s.option_type) === type);

    const fabricTile = { name: item.product_name, image: item.product_image, price: item.unit_price };
    
    // Any selection that is not a measurement, note, reference file, or monogram is a garment design style.
    const MEASUREMENT_TYPES = MEASUREMENT_FIELDS.map(f => normalizeType(f.type)).concat(['notes', 'reference file', 'monogram']);
    const styleSelections = selections.filter(s => !MEASUREMENT_TYPES.includes(normalizeType(s.option_type)));

    // Everything else saved on a bespoke item (chest/waist/etc, notes, the
    // reference-file name) that isn't one of the design tiles above.
    const measurementRows = isBespoke
        ? MEASUREMENT_FIELDS
              .map((f) => ({ ...f, value: byType(f.type)?.option_name }))
              .filter((f) => f.value)
        : [];
    const notes = isBespoke ? byType('notes')?.option_name : null;
    const referenceFileName = isBespoke ? byType('reference file')?.option_name : null;

    // Monogram analysis
    const monogramSelection = byType('monogram');
    const hasMonogram = item.monogram_enabled || monogramSelection;
    let monogramInitials = item.monogram_text || monogramSelection?.option_name || '';
    let monogramPlacement = item.monogram_placement_name || '—';
    let monogramColor = item.monogram_color_name || '—';
    let monogramFont = item.monogram_font_name || '—';
    let monogramPrice = item.monogram_price || monogramSelection?.option_price || 0;

    if (monogramInitials && monogramInitials.includes(' (')) {
        const parts = monogramInitials.split(' (');
        monogramInitials = parts[0].replace(/^"|"$/g, '').trim();
        const detailsStr = (parts[1] || '').replace(/\)$/, '').trim();
        if (detailsStr) {
            if (detailsStr.includes('Placement:')) {
                const matchP = detailsStr.match(/Placement:\s*([^,)]+)/i);
                if (matchP && monogramPlacement === '—') monogramPlacement = matchP[1].trim();
                const matchC = detailsStr.match(/Color:\s*([^,)]+)/i);
                if (matchC && monogramColor === '—') monogramColor = matchC[1].trim();
                const matchF = detailsStr.match(/Font:\s*([^,)]+)/i);
                if (matchF && monogramFont === '—') monogramFont = matchF[1].trim();
            } else {
                const tokens = detailsStr.split(',').map(t => t.trim()).filter(Boolean);
                if (tokens[0] && monogramPlacement === '—') monogramPlacement = tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1);
                if (tokens[1] && monogramColor === '—') monogramColor = tokens[1].charAt(0).toUpperCase() + tokens[1].slice(1);
                if (tokens[2] && monogramFont === '—') monogramFont = tokens[2].charAt(0).toUpperCase() + tokens[2].slice(1);
            }
        }
    }
    if (hasMonogram && (monogramFont === '—' || !monogramFont)) {
        monogramFont = 'Standard / Block';
    }

    return (
        <div className="border-t border-slate-100 pt-5 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {PRODUCT_TYPE_LABELS[item.product_type] || item.product_type}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                    {item.quantity}x — {money(item.total_price ?? item.unit_price)}
                </span>
            </div>

            {isGarment ? (
                <>
                    <SectionCard icon={Shirt} title="Garment Design">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <DesignTile label="Fabric" item={fabricTile} />
                            {styleSelections.map((style, idx) => (
                                <DesignTile
                                    key={idx}
                                    label={style.option_type}
                                    item={{ name: style.option_name, image: style.option_image, price: style.option_price }}
                                />
                            ))}
                        </div>
                    </SectionCard>

                    <div className="mt-4 space-y-4">
                        {isBespoke ? (
                            <>
                                <SectionCard icon={Ruler} title="Measurements">
                                    {measurementRows.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {measurementRows.map((row) => (
                                                <InfoRow key={row.type} label={row.label} value={row.value} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">
                                            No measurements were entered for this item.
                                        </p>
                                    )}
                                    {notes && (
                                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                                            <InfoRow label="Notes" value={notes} />
                                        </div>
                                    )}
                                </SectionCard>

                                <SectionCard icon={FileText} title="Measurement Document">
                                    {item.measurement_file ? (
                                        <a
                                            href={resolveImage(item.measurement_file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-[#C8A64D] font-medium border border-dashed border-[#C8A64D]/40 rounded-lg px-3 py-2 hover:bg-[#C8A64D]/5 transition-colors w-fit"
                                        >
                                            <FileText size={16} /> View Attachment — Click to open file
                                        </a>
                                    ) : referenceFileName ? (
                                        <a
                                            href={resolveImage(referenceFileName)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-[#C8A64D] font-medium border border-dashed border-[#C8A64D]/40 rounded-lg px-3 py-2 hover:bg-[#C8A64D]/5 transition-colors w-fit"
                                        >
                                            <FileText size={16} /> View Reference File ({referenceFileName.split('/').pop()})
                                        </a>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">
                                            No measurement document was uploaded for this item yet.
                                        </p>
                                    )}
                                </SectionCard>
                            </>
                        ) : (
                            <SectionCard icon={Ruler} title="Measurements">
                                <div className="grid grid-cols-3 gap-4">
                                    <InfoRow label="Method" value={
                                        <span className="inline-block px-2 py-0.5 rounded bg-[#C8A64D]/10 text-[#C8A64D] text-xs font-semibold">
                                            {item.is_custom ? 'CUSTOM MEASUREMENT' : 'STANDARD SIZE'}
                                        </span>
                                    } />
                                    <InfoRow label="Selected Size" value={item.selected_size || '—'} />
                                    <InfoRow label="Fit Style" value={item.fit_style || '—'} />
                                </div>
                            </SectionCard>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <SectionCard icon={PackageSearch} title="Product Details">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <DesignTile label="Fabric" item={fabricTile} />
                        </div>
                    </SectionCard>

                    {(item.selected_size || item.fit_style) && (
                        <div className="mt-4">
                            <SectionCard icon={Ruler} title="Size Information">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoRow label="Selected Size" value={item.selected_size || '—'} />
                                    <InfoRow label="Fit Style" value={item.fit_style || '—'} />
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </>
            )}

            {hasMonogram ? (
                <div className="mt-4">
                    <SectionCard icon={Sparkles} title="Monogram Customization">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <InfoRow label="Initials / Text" value={
                                <span className="font-serif font-bold tracking-wider uppercase text-[#C8A64D] text-sm">
                                    &ldquo;{monogramInitials}&rdquo;
                                </span>
                            } />
                            <InfoRow label="Placement" value={monogramPlacement} />
                            <InfoRow label="Thread Color" value={
                                <span className="flex items-center gap-2">
                                    {item.monogram_color_image && (
                                        <img src={resolveImage(item.monogram_color_image)} alt={monogramColor} className="w-5 h-5 rounded border object-cover shrink-0" />
                                    )}
                                    <span className="truncate">{monogramColor}</span>
                                </span>
                            } />
                            <InfoRow label="Font Style" value={
                                <span className="flex items-center gap-2">
                                    {item.monogram_font_preview_image && (
                                        <img src={resolveImage(item.monogram_font_preview_image)} alt={monogramFont} className="h-5 object-contain shrink-0" />
                                    )}
                                    <span className="truncate">{monogramFont}</span>
                                </span>
                            } />
                            <InfoRow label="Extra Price" value={
                                <span className="font-semibold text-[#C8A64D]">
                                    +{money(monogramPrice)}
                                </span>
                            } />
                        </div>
                    </SectionCard>
                </div>
            ) : null}
        </div>
    );
}

export default function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    const isGuest = !order.user_id;
    const email = order.user_email || null;
    const mobile = order.customer_mobile || order.user_mobile || null;

    // Prefer the structured user_addresses row (registered user with a
    // saved address); fall back to parsing the flat shipping_address text
    // stored on the order itself (guest checkout).
    const hasStructuredAddress = Boolean(order.address_city || order.address_state || order.address_postal_code);
    const freeform = hasStructuredAddress ? null : parseFreeformAddress(order.shipping_address);
    const deliveryLine = hasStructuredAddress
        ? [order.house_building, order.street_locality, order.landmark].filter(Boolean).join(', ')
        : order.shipping_address;
    const city = hasStructuredAddress ? order.address_city : freeform?.city;
    const state = hasStructuredAddress ? order.address_state : freeform?.state;
    const postalCode = hasStructuredAddress ? order.address_postal_code : freeform?.postalCode;

    const itemTypes = Array.from(new Set((order.items || []).map((i) => i.product_type)));
    const orderTypeLabel = itemTypes.length === 1
        ? (PRODUCT_TYPE_LABELS[itemTypes[0]] || itemTypes[0])
        : itemTypes.map((t) => PRODUCT_TYPE_LABELS[t] || t).join(' + ');

    const [shipmentInfo, setShipmentInfo] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCarrierSelect, setShowCarrierSelect] = useState(false);
    const [selectedCarrier, setSelectedCarrier] = useState('SHIPROCKET');
    const [shipWeight, setShipWeight] = useState(500);
    const [shipDimensions, setShipDimensions] = useState("10x10x10");

    const fetchShippingData = useCallback(async () => {
        setTrackingLoading(true);
        try {
            const res = await orderApi.getTracking(order.order_id);
            if (res?.success) {
                setShipmentInfo(res.data);
            }
        } catch (err) {
            console.error("Failed to load tracking data", err);
        } finally {
            setTrackingLoading(false);
        }
    }, [order.order_id]);

    useEffect(() => {
        fetchShippingData();
    }, [fetchShippingData]);

    const handleCreateShipment = async () => {
        setActionLoading(true);
        try {
            const res = await orderApi.createShipment(order.order_id, selectedCarrier, shipWeight, shipDimensions);
            showToast.success(`${selectedCarrier === 'SHIPROCKET' ? 'Shiprocket' : 'Delhivery'} shipment created successfully!`);
            setShowCarrierSelect(false);
            fetchShippingData();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Failed to create shipment.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSyncShipment = async () => {
        setActionLoading(true);
        try {
            await orderApi.syncShipment(order.order_id);
            showToast.success('Tracking status synchronized.');
            fetchShippingData();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Failed to sync tracking.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-xl rounded-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between z-10">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">Order <span className="text-[#C8A64D]">Details</span></h2>
                        <p className="text-xs font-medium text-stone-500 mt-1">
                            {order.order_number} <span className="mx-1">•</span> {orderTypeLabel}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <button
                            onClick={() => window.open(`${API_URL}/api/orders/${order.order_id}/invoice/print`, '_blank')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                            title="Print Invoice"
                        >
                            <Printer size={14} />
                            <span>Print Invoice</span>
                        </button>
                        <a
                            href={`${API_URL}/api/orders/${order.order_id}/invoice/download`}
                            className="px-2.5 py-1.5 bg-[#C8A64D] hover:bg-[#b5923b] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                            title="Download Invoice"
                        >
                            <Download size={14} />
                            <span>Download Invoice</span>
                        </a>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 uppercase">
                            {order.order_status}
                        </span>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Customer + Order info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SectionCard icon={User} title="Customer Information">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Full Name" value={order.customer_name} />
                                <InfoRow
                                    label="Email Address"
                                    value={email || (isGuest ? 'Guest checkout — no email captured' : '—')}
                                />
                                <InfoRow label="Mobile Number" value={mobile} />
                                <InfoRow label="Delivery Address" value={deliveryLine} className="col-span-2" />
                                <InfoRow label="City / State" value={[city, state].filter(Boolean).join(', ') || '—'} />
                                <InfoRow label="Postal Code" value={postalCode} />
                            </div>
                        </SectionCard>

                        <SectionCard icon={Calendar} title="Order Information">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Order Number" value={order.order_number} />
                                <InfoRow label="Order Type" value={orderTypeLabel} />
                                <InfoRow label="Placed On" value={order.order_date} />
                                <InfoRow label="Last Updated" value={order.updated_at} />
                                <InfoRow label="Tracking AWB" value={shipmentInfo?.shipment?.awb_number || 'Not assigned yet'} className="col-span-2" />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Per-item garment / product details */}
                    <div className="space-y-5">
                        {(order.items || []).map((item) => (
                            <OrderItemCard key={item.item_id} item={item} />
                        ))}
                    </div>

                    {/* Payment info */}
                    <SectionCard icon={CreditCard} title="Payment Information">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <InfoRow label="Payment Method" value={(order.payment_mode || '—').toString().toUpperCase()} />
                            <InfoRow 
                                label="Payment Gateway" 
                                value={
                                    order.gateway_name === 'CASHFREE' ? (
                                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                                            ⚡ Cashfree
                                        </span>
                                    ) : order.gateway_name === 'ICICI_BANK' || order.gateway_name === 'ICICI' ? (
                                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">
                                            🏛️ ICICI Bank
                                        </span>
                                    ) : order.gateway_name === 'STORE_WALLET' ? (
                                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
                                            👛 Store Wallet
                                        </span>
                                    ) : (
                                        order.gateway_name || '—'
                                    )
                                } 
                            />
                            <InfoRow
                                label="Payment Status"
                                value={
                                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                                        order.payment_status === 'Success'
                                            ? 'bg-green-100 text-green-700'
                                            : order.payment_status === 'Failed'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {order.payment_status || 'Pending'}
                                    </span>
                                }
                            />
                        </div>
                        <div className="border-t border-dashed border-slate-200 pt-3 grid grid-cols-2 gap-4">
                            <InfoRow label="Transaction ID" value={order.transaction_id || '—'} />
                            <InfoRow label="Gateway Payment ID" value={order.gateway_payment_id || '—'} />
                            <InfoRow label="Currency" value={order.currency || 'INR'} />
                            <InfoRow label="Paid On" value={order.paid_at || 'Not paid yet'} />
                        </div>
                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                            <span className="text-xs text-slate-400">Inclusive of all taxes</span>
                            <span className="text-2xl font-bold text-[#C8A64D]">{money(order.grand_total)}</span>
                        </div>
                    </SectionCard>

                    {/* Shipping & tracking */}
                    <SectionCard icon={Truck} title="Courier & Delivery Tracking">
                        {trackingLoading ? (
                            <p className="text-xs text-slate-400">Loading tracking details...</p>
                        ) : shipmentInfo?.shipment ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <InfoRow label="Courier Partner" value={
                                        shipmentInfo.shipment.carrier === 'SHIPROCKET' ? (
                                            <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs border border-purple-200">
                                                🚀 Shiprocket
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
                                                📦 Delhivery
                                            </span>
                                        )
                                    } />
                                    <InfoRow label="AWB / Tracking Ref" value={shipmentInfo.shipment.awb_number} />
                                    <InfoRow label="Status" value={
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">
                                            {shipmentInfo.shipment.shipment_status}
                                        </span>
                                    } />
                                    <InfoRow label="Expected Delivery" value={shipmentInfo.shipment.expected_delivery || 'N/A'} />
                                    <InfoRow label="Last Sync" value={shipmentInfo.shipment.last_tracking_sync ? new Date(shipmentInfo.shipment.last_tracking_sync).toLocaleString() : 'N/A'} />
                                </div>

                                {shipmentInfo.shipment.tracking_url && (
                                    <div className="pt-2">
                                        <a
                                            href={shipmentInfo.shipment.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-[#C8A64D] hover:underline font-medium"
                                        >
                                            View Official {shipmentInfo.shipment.carrier === 'SHIPROCKET' ? 'Shiprocket' : 'Delhivery'} Tracking <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}

                                {/* Timeline */}
                                {shipmentInfo.timeline && shipmentInfo.timeline.length > 0 && (
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Delivery Timeline</p>
                                        <div className="space-y-2">
                                            {shipmentInfo.timeline.map((step) => (
                                                <div key={step.key} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        {step.completed ? (
                                                            <CheckCircle size={14} className="text-emerald-500" />
                                                        ) : (
                                                            <Clock size={14} className="text-slate-300" />
                                                        )}
                                                        <span className={step.current ? "font-bold text-slate-900" : step.completed ? "text-slate-700" : "text-slate-400"}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                    {step.timestamp && (
                                                        <span className="text-slate-400 font-mono text-[0.6875rem]">{new Date(step.timestamp).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 flex justify-end">
                                    <button
                                        onClick={handleSyncShipment}
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={12} className={actionLoading ? "animate-spin" : ""} /> Sync Status Now
                                    </button>
                                </div>
                            </div>
                        ) : showCarrierSelect ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Select Shipping Courier</h4>
                                    <button onClick={() => setShowCarrierSelect(false)} className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                                        Cancel
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div 
                                        onClick={() => setSelectedCarrier('SHIPROCKET')}
                                        className={`cursor-pointer border-2 rounded-xl p-3 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                                            selectedCarrier === 'SHIPROCKET' 
                                                ? 'border-[#C8A64D] bg-[#fbf9f4] shadow-sm' 
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
                                            🚀
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Shiprocket API</p>
                                            <p className="text-[0.625rem] text-slate-500">Fast multi-courier dispatch</p>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setSelectedCarrier('DELHIVERY')}
                                        className={`cursor-pointer border-2 rounded-xl p-3 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                                            selectedCarrier === 'DELHIVERY' 
                                                ? 'border-[#C8A64D] bg-[#fbf9f4] shadow-sm' 
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">
                                            📦
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Delhivery API</p>
                                            <p className="text-[0.625rem] text-slate-500">Direct Delhivery express</p>
                                        </div>
                                    </div>
                                </div>



                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={handleCreateShipment}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#C8A64D] hover:bg-[#b8974a] text-white rounded-lg transition-all shadow-md disabled:opacity-50"
                                    >
                                        {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />} 
                                        Confirm & Dispatch via {selectedCarrier === 'SHIPROCKET' ? 'Shiprocket' : 'Delhivery'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                <div>
                                    <p className="text-xs font-medium text-slate-700">No courier shipment created yet.</p>
                                    <p className="text-xs text-slate-400">Generate waybill & dispatch via Shiprocket or Delhivery API.</p>
                                </div>
                                <button
                                    onClick={() => setShowCarrierSelect(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#C8A64D] hover:bg-[#b8974a] text-white rounded-lg transition-colors shadow sm:w-auto w-full disabled:opacity-50"
                                >
                                    <PlusCircle size={14} /> Create Shipment
                                </button>
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}