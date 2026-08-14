import { fabricApi } from '@/api/fabric.api';

export const rtwFields = [
  { name: 'name', label: 'Item Name', type: 'text', colSpan: 2, section: 'Basic Details', validation: { required: 'Name is required' } },
  { name: 'price', label: 'Selling Price (₹)', type: 'number', section: 'Basic Details', validation: { required: 'Price is required' } },
  { name: 'stock_quantity', label: 'Number of Stocks Available (Pieces) *', type: 'number', section: 'Basic Details', validation: { required: 'Stock quantity is required' } },
  
  // ── FIX: Changed fetchPage to fabricApi.getAvailableForRTW ──
  { 
    name: 'fab_id', 
    label: 'Base Fabric', 
    type: 'paginated-select', 
    section: 'Basic Details', 
    fetchPage: fabricApi.getAvailableForRTW, 
    mapOption: (i) => ({ value: i.fab_id, label: i.fab_name }), 
    editLabelKey: 'fab_name', 
    validation: { required: 'Please select a base fabric' } 
  },

  { name: 'shortDesc', label: 'Short Description', type: 'textarea', colSpan: 2, section: 'Description' },

  { name: 'coverImage', label: 'Cover Image (Model)', type: 'image', colSpan: 1, section: 'Media' },
  { name: 'galleryImages', label: 'Gallery Images', type: 'multi-file', colSpan: 1, section: 'Media' },

  { name: 'isNewArrival', label: 'New Arrival', checkboxLabel: 'Show in New Arrivals', type: 'checkbox', section: 'Visibility' },
  { name: 'isBestSeller', label: 'Best Seller', checkboxLabel: 'Show in Best Sellers', type: 'checkbox', section: 'Visibility' },
];

export const mapRtwDetailToFormData = (data) => ({
  rtw_id: data.rtw_id,
  name: data.rtw_name,
  price: data.rtw_price,
  stock_quantity: data.stock_quantity ?? '',
  fab_id: data.fab_id,
  fab_name: data.fab_name,
  shortDesc: data.rtw_short_desc || '',
  coverImage: data.rtw_cover_image || null,
  galleryImages: data.images || [],
  isNewArrival: !!data.is_new_arrival,
  isBestSeller: !!data.is_best_seller,
});

export const buildRtwPayload = (formValues) => {
  const formData = new FormData();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  
  const textFields = ['name', 'price', 'fab_id', 'stock_quantity', 'shortDesc'];
  textFields.forEach(key => {
    const val = formValues[key]?.value !== undefined ? formValues[key].value : formValues[key];
    if (val !== undefined && val !== null) formData.append(key, val);
  });

  formData.append('isNewArrival', !!formValues.isNewArrival);
  formData.append('isBestSeller', !!formValues.isBestSeller);

  // ── Robust File Extractor for the Cover Image ──
  const img = formValues.coverImage;
  let actualFile = null;

  if (img instanceof File) actualFile = img;
  else if (img instanceof FileList && img.length > 0) actualFile = img[0];
  else if (Array.isArray(img) && img[0] instanceof File) actualFile = img[0];
  else if (img && img.file instanceof File) actualFile = img.file;
  else if (img && img.originFileObj instanceof File) actualFile = img.originFileObj;

  if (actualFile) {
    formData.append('coverImage', actualFile);
  } else if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) {
    formData.append('coverImage', img.replace(API_URL, ''));
  }

  // ── Robust File Extractor for Gallery Images ──
  if (Array.isArray(formValues.galleryImages)) {
    formValues.galleryImages.forEach(fileItem => {
      let gFile = null;
      if (fileItem instanceof File) gFile = fileItem;
      else if (fileItem.file instanceof File) gFile = fileItem.file;
      else if (fileItem.originFileObj instanceof File) gFile = fileItem.originFileObj;
      
      if (gFile) formData.append('galleryImages', gFile);
    });
  }

  return formData;
};