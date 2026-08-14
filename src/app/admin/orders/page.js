import { redirect } from 'next/navigation';

// /admin/orders has no single list of its own anymore — it's split into
// one page per product type (see the Orders group in the sidebar). Land
// on Fabric by default so a stray link here doesn't 404.
export default function OrdersIndexRedirect() {
    redirect('/admin/orders/fabric');
}
