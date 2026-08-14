'use client';
import React, { useEffect, useState } from 'react';
import { orderApi } from '@/api/order.api';
import { ShoppingBag, Scissors, Layers, CheckCircle } from 'lucide-react';
import showToast from '@/sharables/toast';

export default function OrderKPIs() {
    const [stats, setStats] = useState({
        fabric: 0,
        rtw: 0,
        'made-to-wear': 0,
        bespoke: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await orderApi.getOrderStats();
                if (res?.data) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch order stats:", err);
                showToast.error("Failed to load order stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const kpiCards = [
        {
            id: 'fabric',
            label: 'Fabric Orders',
            value: stats.fabric || 0,
            icon: Layers,
            // Blue theme
            bgColor: 'bg-blue-50 border-blue-200',
            iconBg: 'bg-blue-100 text-blue-600',
            textColor: 'text-blue-900',
            hoverColor: 'hover:border-blue-400 hover:shadow-md'
        },
        {
            id: 'rtw',
            label: 'RTW Orders',
            value: stats.rtw || 0,
            icon: ShoppingBag,
            // Emerald theme
            bgColor: 'bg-emerald-50 border-emerald-200',
            iconBg: 'bg-emerald-100 text-emerald-600',
            textColor: 'text-emerald-900',
            hoverColor: 'hover:border-emerald-400 hover:shadow-md'
        },
        {
            id: 'made-to-wear',
            label: 'Made-To-Wear Orders',
            value: stats['made-to-wear'] || 0,
            icon: CheckCircle,
            // Purple theme
            bgColor: 'bg-purple-50 border-purple-200',
            iconBg: 'bg-purple-100 text-purple-600',
            textColor: 'text-purple-900',
            hoverColor: 'hover:border-purple-400 hover:shadow-md'
        },
        {
            id: 'bespoke',
            label: 'Bespoke Orders',
            value: stats.bespoke || 0,
            icon: Scissors,
            // Orange/Gold theme
            bgColor: 'bg-orange-50 border-orange-200',
            iconBg: 'bg-orange-100 text-orange-600',
            textColor: 'text-orange-900',
            hoverColor: 'hover:border-orange-400 hover:shadow-md'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiCards.map((item) => {
                const IconComponent = item.icon;
                return (
                    <div
                        key={item.id}
                        className={`rounded-2xl border p-5 transition-all duration-300 ${item.bgColor} ${item.hoverColor} flex flex-col justify-between group`}
                    >
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="font-bold uppercase tracking-wider font-sans text-[0.6875rem] text-slate-500">
                                {item.label}
                            </span>
                            <div className={`rounded-xl flex items-center justify-center shrink-0 w-9 h-9 ${item.iconBg} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                                <IconComponent className="w-4.5 h-4.5" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-9 w-20 animate-pulse rounded-md bg-white/50 my-1" />
                        ) : (
                            <h3 className={`font-sans font-extrabold leading-tight tracking-tight text-3xl sm:text-4xl ${item.textColor}`}>
                                {item.value}
                            </h3>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
