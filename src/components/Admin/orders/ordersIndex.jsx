'use client';
import React, { useCallback, useState } from 'react';
import { orderApi } from '@/api/order.api';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import showToast from '@/sharables/toast';
import { getOrderColumns } from './orders.columns';
import OrderDetailsModal from './OrderDetailsModal';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportExcel';
import ExportOrdersModal from './ExportOrdersModal';
import OrderKPIs from './OrderKPIs';

/**
 * One orders list scoped to a single product type. Rendered by each of the
 * four route pages (fabric / rtw / made-to-wear / bespoke) with a different
 * productType + title, rather than tabs on a shared page.
 */
export default function OrdersIndex({ productType, title, subtitle })
{

    // useCallback (not a plain inline arrow) so this stays referentially
    // stable across renders — useTableData's fetchData is keyed on it, and
    // a new function identity every render would trigger a refetch loop
    
    const fetchOrders = useCallback(
        (params) => orderApi.getAllOrders({ ...params, productType }),
        [productType]
    );

    const {
        data, loading, search, setSearch,
        page, rowsPerPage, totalRows, fetchData,
        handleSearch, handlePageChange, handleRowsPerPageChange,
    } = useTableData(fetchOrders, `Failed to load ${title.toLowerCase()}.`);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleView = async (order) => {
        try {
            const res = await orderApi.getOrderById(order.order_id);
            setSelectedOrder(res?.data || null);
            setIsViewModalOpen(true);
        } catch (err) {
            showToast.error('Failed to load order details.');
        }
    };

    const [exporting, setExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const handleFullExport = async () => {
        setExporting(true);
        try {
            const res = await orderApi.getAllOrders({ page: 1, limit: 10000, search, productType });
            const allData = res?.data || [];
            
            if (allData.length === 0) {
                showToast.error("No data available to export");
                setExporting(false);
                return;
            }

            const exportData = allData.map(order => {
                let formattedDate = 'N/A';
                if (order.order_date) {
                    if (typeof order.order_date === 'string' && order.order_date.match(/^\d{2}-\d{2}-\d{4}/)) {
                        formattedDate = order.order_date.substring(0, 10).replace(/-/g, '/');
                    } else {
                        const d = new Date(order.order_date);
                        formattedDate = !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : order.order_date;
                    }
                }
                
                return {
                    "Order No": order.order_number,
                    "Date": formattedDate,
                    "Customer Name": order.customer_name || 'N/A',
                    "Mobile": order.customer_mobile || 'N/A',
                    "Email": order.customer_email || 'N/A',
                    "Shipping Address": order.shipping_address ? order.shipping_address.replace(/\\n/g, ', ') : 'N/A',
                    "Subtotal (₹)": Number(order.subtotal || 0).toFixed(2),
                    "Shipping Fee (₹)": Number(order.shipping_fee || 0).toFixed(2),
                    "Grand Total (₹)": Number(order.grand_total || 0).toFixed(2),
                    "Order Status": order.order_status || 'N/A',
                    "Payment Status": order.payment_status || 'PENDING',
                    "Payment Mode": order.payment_mode || 'N/A',
                    "Transaction ID": order.transaction_id || 'N/A',
                    "Carrier": order.carrier || 'N/A',
                    "AWB Number": order.awb_number || 'N/A',
                    "Shipment Status": order.shipment_status || 'N/A',
                    "Tracking URL": order.tracking_url || 'N/A'
                };
            });

            exportToExcel(exportData, `${title.replace(/\s+/g, '_')}_Orders.xlsx`);
            showToast.success("Export successful!");
        } catch (err) {
            console.error(err);
            showToast.error("Failed to export data");
        } finally {
            setExporting(false);
        }
    };

    const handleCustomExport = async ({ startDate, endDate, selectedColumns }) => {
        setExporting(true);
        try {
            const res = await orderApi.getAllOrders({ page: 1, limit: 10000, search, productType, startDate, endDate });
            const allData = res?.data || [];
            
            if (allData.length === 0) {
                showToast.error("No data available to export");
                setExporting(false);
                return;
            }

            const rawExportData = allData.map(order => {
                let formattedDate = 'N/A';
                if (order.order_date) {
                    if (typeof order.order_date === 'string' && order.order_date.match(/^\d{2}-\d{2}-\d{4}/)) {
                        // Extract "DD-MM-YYYY" and replace with "DD/MM/YYYY"
                        formattedDate = order.order_date.substring(0, 10).replace(/-/g, '/');
                    } else {
                        const d = new Date(order.order_date);
                        formattedDate = !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : order.order_date;
                    }
                }
                
                return {
                    "Order No": order.order_number,
                    "Date": formattedDate,
                    "Customer Name": order.customer_name || 'N/A',
                    "Mobile": order.customer_mobile || 'N/A',
                    "Email": order.customer_email || 'N/A',
                    "Shipping Address": order.shipping_address ? order.shipping_address.replace(/\\n/g, ', ') : 'N/A',
                    "Subtotal (₹)": Number(order.subtotal || 0).toFixed(2),
                    "Shipping Fee (₹)": Number(order.shipping_fee || 0).toFixed(2),
                    "Grand Total (₹)": Number(order.grand_total || 0).toFixed(2),
                    "Order Status": order.order_status || 'N/A',
                    "Payment Status": order.payment_status || 'PENDING',
                    "Payment Mode": order.payment_mode || 'N/A',
                    "Transaction ID": order.transaction_id || 'N/A',
                    "Carrier": order.carrier || 'N/A',
                    "AWB Number": order.awb_number || 'N/A',
                    "Shipment Status": order.shipment_status || 'N/A',
                    "Tracking URL": order.tracking_url || 'N/A'
                };
            });

            // Filter columns
            const finalData = rawExportData.map(obj => {
                const newObj = {};
                selectedColumns.forEach(col => {
                    if (obj[col] !== undefined) {
                        newObj[col] = obj[col];
                    }
                });
                return newObj;
            });

            exportToExcel(finalData, `${title.replace(/\s+/g, '_')}_Orders.xlsx`);
            showToast.success("Export successful!");
            setIsExportModalOpen(false);
        } catch (err) {
            console.error(err);
            showToast.error("Failed to export data");
        } finally {
            setExporting(false);
        }
    };

    const columns = getOrderColumns(handleView);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">{title} <span className="text-[#C8A64D]">Orders</span></h1>
                    {subtitle && <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">{subtitle}</p>}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                    <div className="w-full sm:w-80">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            onSearch={handleSearch}
                            placeholder="Search order no., customer, or mobile..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFullExport}
                            disabled={exporting}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-sm font-bold tracking-wide transition-colors disabled:opacity-50"
                            title="Export All Data"
                        >
                            {exporting ? 'Exporting...' : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            disabled={exporting}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm text-sm font-bold tracking-wide transition-colors disabled:opacity-50"
                            title="Custom Export"
                        >
                            Custom Export
                        </button>
                    </div>
                </div>
            </div>
            
            {title === 'All' && <OrderKPIs />}

            <div className="w-full">
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    totalRows={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </div>

            {/* View Details Modal — type-aware layout (fabric/rtw vs made-to-wear vs bespoke) */}
            {isViewModalOpen && selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setIsViewModalOpen(false)} />
            )}

            <ExportOrdersModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleCustomExport}
                exporting={exporting}
            />
        </div>
    );
}