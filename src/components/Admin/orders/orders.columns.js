export const getOrderColumns = (onView) => [
    {
        id: 'sno',
        label: 'S.No',
        render: (row, sno) => sno,
    },
    { id: 'order_number', label: 'Order Number' },
    { id: 'customer_name', label: 'Customer' },
    {
        id: 'order_date',
        label: 'Date',
        // order_date / created_at / paid_at are already formatted into a
        // display string by the backend (formatDatesInPayload — any key
        // ending in _date/_at/_time gets converted server-side), so this
        // just needs to display it, not re-parse it with `new Date()`.
        render: (row) => row.order_date || row.created_at || row.paid_at || 'N/A',
    },
    {
        id: 'grand_total',
        label: 'Total',
        render: (row) => `₹${Number(row.grand_total).toFixed(2)}`,
    },
    {
        id: 'payment_status',
        label: 'Payment',
        render: (row) => (
            <div className="flex flex-col items-start gap-1">
                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${row.payment_status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.payment_status || 'Pending'}
                </span>
                {row.gateway_name && (
                    <span className="text-[0.625rem] text-gray-500 font-medium tracking-tight">
                        {row.gateway_name === 'CASHFREE' ? '⚡ Cashfree' : row.gateway_name === 'ICICI_BANK' || row.gateway_name === 'ICICI' ? '🏛️ ICICI Bank' : row.gateway_name === 'STORE_WALLET' ? '👛 Store Wallet' : row.gateway_name}
                    </span>
                )}
            </div>
        ),
    },
    {
        id: 'order_status',
        label: 'Order Status',
        render: (row) => (
            <span className="font-semibold text-[#C8A64D]">{row.order_status}</span>
        ),
    },
    {
        id: 'actions',
        label: 'Actions',
        render: (row) => (
            <div className="flex gap-2">
                <button
                    onClick={() => onView(row)}
                    className="text-sm px-3 py-1 bg-[#FAFAF8] border border-[#C8A64D] text-[#C8A64D] hover:bg-[#C8A64D] hover:text-white transition-colors rounded-md"
                >
                    View
                </button>
            </div>
        ),
    },
];
