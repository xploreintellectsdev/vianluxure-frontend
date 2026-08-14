export const aboutItemsFields = [
  { name: 'order_no', label: 'Order No', type: 'number', required: false },
  { name: 'item_title', label: 'Title', type: 'text', required: false },
  { name: 'item_text', label: 'Description', type: 'textarea', required: false },
  { name: 'item_image', label: 'Item Image (optional)', type: 'image', required: false },
  { name: 'is_active', label: 'Active', type: 'checkbox' }
];

export const mapAboutItemToFormData = (data) => {
  if (!data) return null;
  return {
    item_id: data.item_id,
    order_no: data.order_no || 0,
    item_title: data.item_title || '',
    item_text: data.item_text || '',
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  };
};

export const buildAboutItemPayload = (formData) => {
  const payload = new FormData();
  Object.keys(formData).forEach(key => {
    if (key !== 'item_id' && key !== 'item_image') {
      let val = formData[key];
      if (key === 'is_active') val = val ? 1 : 0;
      if (val !== undefined && val !== null) {
        payload.append(key, val);
      }
    }
  });
  if (formData.item_image instanceof File) {
    payload.append('item_image', formData.item_image);
  }
  return payload;
};
