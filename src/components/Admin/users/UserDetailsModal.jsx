import React, { useState } from 'react';
import { X, MapPin, Package, Clock, ShieldCheck, Mail, Phone, CalendarDays, Wallet } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const resolveImage = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    return `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

export default function UserDetailsModal({ data, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!data || !data.user) return null;
    const { user, orders, addresses, loginHistory } = data;

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-800">{user.total_orders}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-[#C8A64D]/10 p-3 rounded-full text-[#C8A64D]">
                        <span className="text-xl font-bold font-serif">₹</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Spent</p>
                        <p className="text-2xl font-bold text-slate-800">₹{Number(user.total_spent || 0).toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Wallet Balance</p>
                        <p className="text-2xl font-bold text-slate-800">₹{Number(user.wallet_balance || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> User Profile Information
                    </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1"><Mail className="w-3.5 h-3.5"/> Email</p>
                        <p className="text-sm font-medium text-slate-800">{user.email || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1"><Phone className="w-3.5 h-3.5"/> Mobile</p>
                        <p className="text-sm font-medium text-slate-800">{user.mobile || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1"><CalendarDays className="w-3.5 h-3.5"/> Member Since</p>
                        <p className="text-sm font-medium text-slate-800">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5"/> Last Login</p>
                        <p className="text-sm font-medium text-slate-800">{user.last_login ? new Date(user.last_login).toLocaleString('en-GB') : 'Never'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-4">
            {orders && orders.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[0.625rem] font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Order No</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((o) => (
                                <tr key={o.order_id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{o.order_number}</td>
                                    <td className="px-4 py-3 text-slate-600">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                                    <td className="px-4 py-3 font-medium text-emerald-600">₹{Number(o.grand_total).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-slate-600">{o.order_status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No orders found for this user.</p>
                </div>
            )}
        </div>
    );

    const renderAddresses = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses && addresses.length > 0 ? (
                addresses.map(addr => (
                    <div key={addr.address_id} className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                        {addr.is_default === 1 && (
                            <span className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[0.625rem] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">Default</span>
                        )}
                        <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" /> {addr.full_name}
                        </h4>
                        <p className="text-sm text-slate-600 ml-6 leading-relaxed">
                            {addr.house_building}, {addr.street_locality}<br/>
                            {addr.landmark && <>{addr.landmark}<br/></>}
                            {addr.city}, {addr.state} - {addr.postal_code}<br/>
                            {addr.country}
                        </p>
                        <p className="text-xs text-slate-500 ml-6 mt-2 flex gap-3">
                            <span>Phone: <span className="font-medium text-slate-700">{addr.mobile}</span></span>
                            <span>Type: <span className="font-medium text-slate-700">{addr.address_type}</span></span>
                        </p>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No saved addresses found.</p>
                </div>
            )}
        </div>
    );

    const renderLoginActivity = () => (
        <div className="space-y-4">
            {loginHistory && loginHistory.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[0.625rem] font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loginHistory.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-slate-600">{new Date(log.login_time).toLocaleString('en-GB')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wider rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No recent login activity found.</p>
                </div>
            )}
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'orders', label: 'Order History', count: user.total_orders },
        { id: 'addresses', label: 'Addresses', count: addresses?.length },
        { id: 'activity', label: 'Login Activity' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col shadow-xl rounded-2xl">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">User <span className="text-[#C8A64D]">Details</span></h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={22} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto no-scrollbar">
                    <div className="mb-6 -mt-2">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-xl font-serif font-bold text-slate-700 overflow-hidden">
                        {user.profile_pic ? (
                            <img src={resolveImage(user.profile_pic)} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            {user.email || user.mobile}
                            {user.is_active === 1 ? (
                                <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active</span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactive</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'border-slate-800 text-slate-800'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${activeTab === tab.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'addresses' && renderAddresses()}
                {activeTab === 'activity' && renderLoginActivity()}
            </div>
            </div>
            </div>
        </div>
    );
}
