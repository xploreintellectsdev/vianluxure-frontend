export const storySectionFields = [
  { name: 'section_key', label: 'Section Key (e.g. story-cotton)', type: 'text', required: true },
  { name: 'order_no', label: 'Order Number', type: 'number', required: false },
  { name: 'eyebrow_label', label: 'Eyebrow Label (e.g. A Fibre\'s Journey)', type: 'text', required: false },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: false },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
];

export const mapStorySectionToFormData = (section) => ({
  section_id: section.section_id,
  section_key: section.section_key || '',
  order_no: section.order_no || 0,
  eyebrow_label: section.eyebrow_label || '',
  title: section.title || '',
  description: section.description || '',
  is_active: section.is_active === 1 || section.is_active === true
});

export const buildStorySectionPayload = (formData) => {
  return {
    section_key: formData.section_key,
    order_no: Number(formData.order_no),
    eyebrow_label: formData.eyebrow_label,
    title: formData.title,
    description: formData.description,
    is_active: formData.is_active ? 1 : 0
  };
};
