import { productTypeApi } from '@/api/productType.api';
import { fabricCategoryApi } from '@/api/fabricCategory.api';
import { colorApi } from '@/api/color.api';
import { originApi } from '@/api/origin.api';
import { weightApi } from '@/api/weight.api';
import { weaveApi } from '@/api/weave.api';
import { patternApi } from '@/api/pattern.api';
import { styleApi } from '@/api/style.api';

// ── FIX: Put the actual database ID of your "Ready to wear" product type here! ──
const ready_to_wear_master_ID = 2; 

export const fabricFields = [
  // ── BASIC DETAILS ──
  { name: 'name', label: 'Fabric Name', type: 'text', colSpan: 2, section: 'Basic Details', validation: { required: 'Name is required' } },
  { name: 'price', label: 'Price per Meter', type: 'number', section: 'Basic Details', validation: { required: 'Price is required' } },
  { name: 'groupCode', label: 'Design Group Code (Optional)', type: 'text', section: 'Basic Details', placeholder: 'Auto-generates if empty' },
  { name: 'stitching_charges', label: 'Stitching Charges (Cost in Rs) *', type: 'number', step: 'any', section: 'Basic Details', placeholder: 'e.g. 500, 1500', validation: { required: 'Stitching cost is required' } },
  { name: 'stock_quantity', label: 'Fabric Stock Available (in Meters) *', type: 'number', step: 'any', section: 'Basic Details', placeholder: 'e.g. 50, 100.5', validation: { required: 'Fabric stock in meters is required' } },

  // ── CLASSIFICATION ──
  { 
    name: 'productTypes', 
    label: 'Product Types *', 
    type: 'async-checkbox-group', 
    colSpan: 2,
    section: 'Classification', 
    fetchPage: productTypeApi.getAll, 
    mapOption: (i) => ({ value: i.pt_id, label: i.pt_name }), 
    validation: { required: 'Please select at least one product type' } 
  },
  
  { name: 'fc_id', label: 'Category', type: 'paginated-select', section: 'Classification', fetchPage: fabricCategoryApi.getAll, mapOption: (i) => ({ value: i.fc_id, label: i.fc_name }), editLabelKey: 'fc_name' },
  { name: 'col_id', label: 'Color', type: 'paginated-select', section: 'Classification', fetchPage: colorApi.getAll, mapOption: (i) => ({ value: i.col_id, label: i.col_name }), editLabelKey: 'col_name' },
  { name: 'org_id', label: 'Origin', type: 'paginated-select', section: 'Classification', fetchPage: originApi.getAll, mapOption: (i) => ({ value: i.org_id, label: i.org_name }), editLabelKey: 'org_name' },
  { name: 'wt_id', label: 'Weight', type: 'paginated-select', section: 'Classification', fetchPage: weightApi.getAll, mapOption: (i) => ({ value: i.wt_id, label: i.wt_name }), editLabelKey: 'wt_name' },
  { name: 'wv_id', label: 'Weave', type: 'paginated-select', section: 'Classification', fetchPage: weaveApi.getAll, mapOption: (i) => ({ value: i.wv_id, label: i.wv_name }), editLabelKey: 'wv_name' },
  { name: 'pat_id', label: 'Pattern', type: 'paginated-select', section: 'Classification', fetchPage: patternApi.getAll, mapOption: (i) => ({ value: i.pat_id, label: i.pat_name }), editLabelKey: 'pat_name' },
  { name: 'styles', label: 'Styles', type: 'multi-paginated-select', colSpan: 2, section: 'Classification', fetchPage: styleApi.getAll, mapOption: (i) => ({ value: i.sty_id, label: i.sty_name }), editValueKey: 'sty_id', editLabelKey: 'sty_name', placeholder: 'Select styles (Casual, Formal, ...)' },

  // ── TECHNICAL INFO & DESCRIPTION ──
  { name: 'specifications', label: 'Fabric Specs & Care', type: 'specs', colSpan: 2, section: 'Technical Info', defaultValue: [{title: 'Composition', value: ''}, {title: 'Care', value: ''}] },
  { name: 'disclaimer', label: 'Disclaimer', type: 'textarea', colSpan: 2, section: 'Technical Info', placeholder: 'e.g. Slight color variation may occur due to screen/lighting differences.' },
  { name: 'shortDesc', label: 'Short Description', type: 'textarea', colSpan: 2, section: 'Description' },
  { name: 'longDesc', label: 'Long Description', type: 'textarea', colSpan: 2, section: 'Description' },

  // ── FABRIC MEDIA & VISIBILITY ──
  { name: 'coverImage', label: 'Cover Image', type: 'image', colSpan: 1, section: 'Media' },
  { name: 'galleryImages', label: 'Gallery Images', type: 'multi-file', colSpan: 1, section: 'Media' },
  { name: 'isNewArrival', label: 'New Arrival', checkboxLabel: 'Show in New Arrivals', type: 'checkbox', section: 'Visibility' },
  { name: 'isBestSeller', label: 'Best Seller', checkboxLabel: 'Show in Best Sellers', type: 'checkbox', section: 'Visibility' },

  // ── READY TO WEAR DETAILS ──
  { 
    name: 'rtwName', 
    label: 'Ready To Wear Item Name *', 
    type: 'text', 
    colSpan: 2, 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID),
    validation: {
        // Only require it if the box is checked!
        validate: (val, formValues) => 
          !formValues?.productTypes?.includes(ready_to_wear_master_ID) || !!val || 'Item Name is required'
    }
  },
  { 
    name: 'rtwPrice', 
    label: 'Ready To Wear Selling Price (₹) *', 
    type: 'number', 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID),
    validation: {
        validate: (val, formValues) => 
          !formValues?.productTypes?.includes(ready_to_wear_master_ID) || !!val || 'Price is required'
    }
  },
  { 
    name: 'rtwStock', 
    label: 'Number of RTW Stocks Available (Pieces) *', 
    type: 'number', 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID),
    validation: {
        validate: (val, formValues) => 
          !formValues?.productTypes?.includes(ready_to_wear_master_ID) || (val !== undefined && val !== null && val !== '') || 'RTW stock count is required'
    }
  },
  { 
    name: 'rtwShortDesc', 
    label: 'Ready To Wear Short Description', 
    type: 'textarea', 
    colSpan: 2, 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID),
  },
  { 
    name: 'rtwCoverImage', 
    label: 'Ready To Wear Cover Image *', 
    type: 'image', 
    colSpan: 1, 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID),
    validation: {
        validate: (val, formValues) => 
          !formValues?.productTypes?.includes(ready_to_wear_master_ID) || !!val || 'Cover Image is required'
    }
  },
  // ── FIX: Restored Gallery and Checkboxes for RTW! ──
  { 
    name: 'rtwGalleryImages', 
    label: 'Ready To Wear Gallery Images', 
    type: 'multi-file', 
    colSpan: 1, 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID) 
  },
  { 
    name: 'rtwIsNewArrival', 
    label: 'New Arrival (Ready To wear)', 
    checkboxLabel: 'Show in New Arrivals', 
    type: 'checkbox', 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID) 
  },
  { 
    name: 'rtwIsBestSeller', 
    label: 'Best Seller (Ready To wear)', 
    checkboxLabel: 'Show in Best Sellers', 
    type: 'checkbox', 
    section: 'Ready To Wear Details', 
    showIf: (values) => values?.productTypes?.includes(ready_to_wear_master_ID) 
  },
];

export const mapFabricDetailToFormData = (data) => ({
  fab_id: data.fab_id,
  name: data.fab_name,
  price: data.fab_price_per_meter,
  groupCode: data.fab_group_code,
  gst: data.fab_gst ?? '',
  stitching_charges: data.fab_stitching_charges ?? '',
  stock_quantity: data.stock_quantity ?? '',
  productTypes: (data.productTypes || []).map(pt => pt.pt_id),
  fc_id: data.fc_id,
  fc_name: data.fc_name,
  org_id: data.org_id,
  org_name: data.org_name,
  wt_id: data.wt_id,
  wt_name: data.wt_name,
  wv_id: data.wv_id,
  wv_name: data.wv_name,
  pat_id: data.pat_id,
  pat_name: data.pat_name,
  col_id: data.col_id,
  col_name: data.col_name,
  shortDesc: data.fab_short_desc,
  longDesc: data.fab_long_desc,
  disclaimer: data.fab_disclaimer || '',
  coverImage: data.fab_cover_image,
  galleryImages: data.images || [],
  specifications: (data.specifications || []).map(s => ({ title: s.spec_title, value: s.spec_value })),
  styles: (data.styles || []).map(s => ({ value: s.sty_id, label: s.sty_name })),
  isNewArrival: !!data.is_new_arrival,
  isBestSeller: !!data.is_best_seller,
  
  // ── MAPPING FOR RTW ──
  rtwName: data.rtw_name || '',
  rtwPrice: data.rtw_price || '',
  rtwStock: data.rtwStock ?? '',
  rtwShortDesc: data.rtw_short_desc || '',
  rtwCoverImage: data.rtw_cover_image || null,
  rtwGalleryImages: data.rtw_images || [],
  rtwIsNewArrival: !!data.rtw_is_new_arrival,
  rtwIsBestSeller: !!data.rtw_is_best_seller,
});

export const buildFabricPayload = (formValues) => {
  const formData = new FormData();
  
  const textFields = ['name', 'price', 'groupCode', 'gst', 'stitching_charges', 'stock_quantity', 'fc_id', 'org_id', 'wt_id', 'wv_id', 'pat_id', 'col_id', 'shortDesc', 'longDesc', 'disclaimer', 'rtwName', 'rtwPrice', 'rtwStock', 'rtwShortDesc'];
  
  textFields.forEach(key => {
    const val = formValues[key]?.value !== undefined ? formValues[key].value : formValues[key];
    if (val !== undefined && val !== null) formData.append(key, val);
  });

  if (formValues.productTypes) {
    const ptIds = formValues.productTypes.map(pt => {
      if (pt && typeof pt === 'object') return pt.value ?? pt.pt_id;
      return pt;
    });
    formData.append('productTypes', JSON.stringify(ptIds));
  }

  if (formValues.specifications) formData.append('specifications', JSON.stringify(formValues.specifications));
  if (formValues.styles) {
    const styleIds = formValues.styles.map(s => {
      if (s && typeof s === 'object') return s.value ?? s.sty_id;
      return s;
    });
    formData.append('styles', JSON.stringify(styleIds));
  }

  formData.append('isNewArrival', !!formValues.isNewArrival);
  formData.append('isBestSeller', !!formValues.isBestSeller);
  
  // ── FIX: Append RTW checkboxes ──
  formData.append('rtwIsNewArrival', !!formValues.rtwIsNewArrival);
  formData.append('rtwIsBestSeller', !!formValues.rtwIsBestSeller);

  if (formValues.coverImage instanceof File) formData.append('coverImage', formValues.coverImage); 
  if (formValues.rtwCoverImage instanceof File) formData.append('rtwCoverImage', formValues.rtwCoverImage); 

  if (Array.isArray(formValues.galleryImages)) {
    formValues.galleryImages.forEach(file => {
      if (file instanceof File) {
        formData.append('galleryImages', file); 
      }
    });
  }

  // ── FIX: Append RTW Gallery Images ──
  if (Array.isArray(formValues.rtwGalleryImages)) {
    formValues.rtwGalleryImages.forEach(file => {
      if (file instanceof File) {
        formData.append('rtwGalleryImages', file); 
      }
    });
  }

  return formData;
};