import React from 'react';
import { getImageUrl } from '@/utils/imageUtils';

export const aboutItemsColumns = [
  { 
    id: 'order_no', 
    label: 'Order', 
    render: row => row.order_no 
  },
  { 
    id: 'item_image', 
    label: 'Image', 
    render: row => row.item_image ? (
      <div className="w-12 h-12 relative rounded overflow-hidden">
        <img src={getImageUrl(row.item_image, 'about-page')} alt="Item" className="object-cover w-full h-full" />
      </div>
    ) : (
      <span className="text-stone-400 text-xs italic">No image</span>
    )
  },
  { 
    id: 'item_title', 
    label: 'Title', 
    render: row => row.item_title 
  },
  { 
    id: 'active', 
    label: 'Active', 
    render: row => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider ${
        (row.is_active === 1 || row.is_active === true) ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
      }`}>
        {(row.is_active === 1 || row.is_active === true) ? 'Active' : 'Inactive'}
      </span>
    )
  }
];
