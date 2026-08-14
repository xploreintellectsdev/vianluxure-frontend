export const heroSlidesFields = [
  { name: 'title', label: 'Slide Title', type: 'text', colSpan: 2, section: 'Basic Information', validation: { required: 'Title is required' } },
  { name: 'order_no', label: 'Display Order No', type: 'number', section: 'Basic Information', defaultValue: 0 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, section: 'Content' },
  { name: 'button_text', label: 'Button Text', type: 'text', section: 'Action' },
  { name: 'button_link', label: 'Button Link', type: 'text', section: 'Action' },
  { name: 'image', label: 'Slide Image', type: 'image', colSpan: 2, section: 'Media', validation: { required: 'Please upload a slide image' } },
  { name: 'is_active', label: 'Active Status', checkboxLabel: 'Publish and show publicly', type: 'checkbox', section: 'Visibility', defaultValue: true },
];

export const mapHeroSlideToFormData = (data) => ({
  slide_id: data.slide_id,
  title: data.title || '',
  order_no: data.order_no ?? 0,
  description: data.description || '',
  button_text: data.button_text || '',
  button_link: data.button_link || '',
  image: data.image || null,
  is_active: !!data.is_active,
});

export const buildHeroSlidePayload = (formValues) => {
  const formData = new FormData();
  
  formData.append('title', formValues.title || '');
  formData.append('order_no', formValues.order_no ?? 0);
  formData.append('description', formValues.description || '');
  formData.append('button_text', formValues.button_text || '');
  formData.append('button_link', formValues.button_link || '');
  formData.append('is_active', formValues.is_active ? 'true' : 'false');

  const img = formValues.image;
  let actualFile = null;
  if (img instanceof File) actualFile = img;
  else if (img instanceof FileList && img.length > 0) actualFile = img[0];
  else if (Array.isArray(img) && img[0] instanceof File) actualFile = img[0];
  if (actualFile) formData.append('image', actualFile);

  return formData;
};

// --- Marquee Items ---

export const heroMarqueeFields = [
  { name: 'item_text', label: 'Marquee Text', type: 'text', colSpan: 2, section: 'Basic Information', validation: { required: 'Text is required' } },
  { name: 'order_no', label: 'Display Order No', type: 'number', section: 'Basic Information', defaultValue: 0 },
  { name: 'is_active', label: 'Active Status', checkboxLabel: 'Publish and show publicly', type: 'checkbox', section: 'Visibility', defaultValue: true },
];

export const mapHeroMarqueeToFormData = (data) => ({
  item_id: data.item_id,
  item_text: data.item_text || '',
  order_no: data.order_no ?? 0,
  is_active: !!data.is_active,
});

export const buildHeroMarqueePayload = (formValues) => {
  // No files, just JSON
  return {
    item_text: formValues.item_text || '',
    order_no: formValues.order_no ?? 0,
    is_active: formValues.is_active,
  };
};
