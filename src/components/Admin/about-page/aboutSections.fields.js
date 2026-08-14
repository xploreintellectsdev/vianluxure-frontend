export const aboutSectionsFields = [
  { name: 'section_key', label: 'Section Key (e.g. about-hero)', type: 'text', required: true },
  { 
    name: 'section_type', 
    label: 'Section Type', 
    type: 'select', 
    options: [
      { value: 'hero', label: 'Hero (Title, Desc, Image)' },
      { value: 'richtext', label: 'Rich Text (Title, Desc)' },
      { value: 'split_image', label: 'Split Image (Image + Title + Bullets)' },
      { value: 'process', label: 'Process (Bespoke Steps)' },
      { value: 'gallery', label: 'Gallery (Marquee Images)' }
    ],
    required: true 
  },
  { name: 'order_no', label: 'Order No', type: 'number', required: false },
  { 
    name: 'eyebrow_label', 
    label: 'Eyebrow Label', 
    type: 'text', 
    required: false,
    showIf: (values) => ['richtext', 'process'].includes(values?.section_type)
  },
  { 
    name: 'title', 
    label: 'Title', 
    type: 'text', 
    required: false,
    showIf: (values) => ['hero', 'richtext', 'split_image', 'process'].includes(values?.section_type)
  },
  { 
    name: 'description', 
    label: 'Description', 
    type: 'textarea', 
    required: false,
    showIf: (values) => ['hero', 'richtext', 'split_image', 'process'].includes(values?.section_type)
  },
  { 
    name: 'bullet_points', 
    label: 'Bullet Points (Title & Content)', 
    type: 'specs', 
    required: false,
    showIf: (values) => values?.section_type === 'split_image'
  },
  { 
    name: 'image', 
    label: 'Image', 
    type: 'image', 
    required: false,
    showIf: (values) => ['hero', 'split_image', 'process'].includes(values?.section_type)
  },
  { 
    name: 'button_text', 
    label: 'Button Text / Bullet List Title', 
    type: 'text', 
    required: false,
    showIf: (values) => ['split_image', 'process'].includes(values?.section_type)
  },
  { 
    name: 'button_link', 
    label: 'Button Link', 
    type: 'text', 
    required: false,
    showIf: (values) => ['process'].includes(values?.section_type)
  },

  { 
    name: 'process_steps', 
    label: 'Process Steps (Title & Description)', 
    type: 'specs', 
    required: false,
    showIf: (values) => values?.section_type === 'process'
  },
  { name: 'is_active', label: 'Active', type: 'checkbox' }
];

export const mapAboutSectionToFormData = (data) => {
  if (!data) return null;
  
  let bullet_points = [];
  let process_steps = [];
  if (data.items && Array.isArray(data.items)) {
    if (data.section_type === 'split_image') {
      bullet_points = data.items
        .filter(item => !item.item_image)
        .map(item => ({ title: item.item_title || '', value: item.item_text || '' }));
    }
      
    if (data.section_type === 'process') {
      process_steps = data.items
        .filter(item => !item.item_image)
        .map(item => ({ title: item.item_title || '', value: item.item_text || '' }));
    }
  }

  return {
    section_id: data.section_id,
    section_key: data.section_key || '',
    section_type: data.section_type || 'hero',
    order_no: data.order_no || 0,
    eyebrow_label: data.eyebrow_label || '',
    title: data.title || '',
    description: data.description || '',
    bullet_points: bullet_points,
    process_steps: process_steps,
    image: data.image || null,
    items: data.items || [],
    button_text: data.button_text || '',
    button_link: data.button_link || '',
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  };
};

export const buildAboutSectionPayload = (formData) => {
  const payload = new FormData();
  Object.keys(formData).forEach(key => {
    if (key !== 'section_id' && key !== 'image' && key !== 'gallery_images') {
      let val = formData[key];
      if (key === 'is_active') val = val ? 1 : 0;
      if (key === 'bullet_points') {
        if (formData.section_type !== 'split_image') return;
        val = Array.isArray(val) ? JSON.stringify(val.filter(b => b && typeof b === 'object' ? b.title?.trim() : b?.trim())) : '[]';
      }
      if (key === 'process_steps') {
        if (formData.section_type !== 'process') return;
        val = Array.isArray(val) ? JSON.stringify(val.filter(s => s.title && s.title.trim())) : '[]';
      }
      if (val !== undefined && val !== null) {
        payload.append(key, val);
      }
    }
  });
  if (formData.image instanceof File) {
    payload.append('image', formData.image);
  }
  return payload;
};
