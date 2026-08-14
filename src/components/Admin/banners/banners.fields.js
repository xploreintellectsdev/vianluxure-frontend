export const bannersFields = [
  { name: 'banner_key', label: 'Banner Key (e.g. fabric-shop)', type: 'text', required: true },
  { 
    name: 'layout_type', 
    label: 'Layout Type', 
    type: 'select', 
    required: true,
    options: [
      { value: 'overlay', label: 'Overlay (Image + Text)' },
      { value: 'split-stats', label: 'Split with Stats' }
    ]
  },
  { name: 'image', label: 'Banner Image', type: 'image', required: true, colSpan: 2 },
  { name: 'order_no', label: 'Order Number', type: 'number', required: false },
  { name: 'eyebrow_label', label: 'Eyebrow Label (e.g. MADE TO MOVE)', type: 'text', required: false },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { 
    name: 'description', 
    label: 'Description', 
    type: 'textarea', 
    required: false, 
    colSpan: 2,
    showIf: (values) => values?.layout_type === 'split-stats'
  },
  { name: 'button_text', label: 'Button Text', type: 'text', required: false },
  { name: 'button_link', label: 'Button Link', type: 'text', required: false },
  { 
    name: 'stats', 
    label: 'Statistics', 
    type: 'specs', 
    colSpan: 2,
    showIf: (values) => values?.layout_type === 'split-stats'
  },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
];

export const mapBannerToFormData = (banner) => ({
  banner_id: banner.banner_id,
  banner_key: banner.banner_key || '',
  layout_type: banner.layout_type || 'overlay',
  image: banner.image || '',
  order_no: banner.order_no || 0,
  eyebrow_label: banner.eyebrow_label || '',
  title: banner.title || '',
  description: banner.description || '',
  button_text: banner.button_text || '',
  button_link: banner.button_link || '',
  is_active: banner.is_active === 1 || banner.is_active === true,
  stats: (banner.stats || []).map(s => ({
    title: s.stat_label,
    value: s.stat_value
  }))
});

export const buildBannerPayload = (formData) => {
  const data = new FormData();
  if (formData.image instanceof File) {
    data.append('image', formData.image);
  }
  data.append('banner_key', formData.banner_key);
  data.append('layout_type', formData.layout_type);
  data.append('order_no', formData.order_no);
  data.append('eyebrow_label', formData.eyebrow_label || '');
  data.append('title', formData.title);
  data.append('description', formData.description || '');
  data.append('button_text', formData.button_text || '');
  data.append('button_link', formData.button_link || '');
  data.append('is_active', formData.is_active ? 1 : 0);

  if (formData.layout_type === 'split-stats') {
    const statsArray = (formData.stats || []).map((s, idx) => ({
      order_no: idx,
      stat_label: s.title,
      stat_value: s.value
    }));
    data.append('stats', JSON.stringify(statsArray));
  } else {
    data.append('stats', JSON.stringify([]));
  }
  
  return data;
};
