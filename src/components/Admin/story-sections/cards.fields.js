export const cardsFields = [
  { name: 'image', label: 'Image', type: 'image', required: true },
  { name: 'order_no', label: 'Order Number', type: 'number', required: false },
  { name: 'caption', label: 'Caption (e.g. 5000+ BCE)', type: 'text', required: false },
  { name: 'card_title', label: 'Card Title', type: 'text', required: true },
  { name: 'card_description', label: 'Card Description', type: 'textarea', required: false },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
];

export const mapCardToFormData = (card) => ({
  card_id: card.card_id,
  image: card.image,
  order_no: card.order_no || 0,
  caption: card.caption || '',
  card_title: card.card_title || '',
  card_description: card.card_description || '',
  is_active: card.is_active === 1 || card.is_active === true
});

export const buildCardPayload = (formData) => {
  const data = new FormData();
  if (formData.image instanceof File) {
    data.append('image', formData.image);
  }
  data.append('order_no', formData.order_no);
  data.append('caption', formData.caption);
  data.append('card_title', formData.card_title);
  data.append('card_description', formData.card_description);
  data.append('is_active', formData.is_active ? 1 : 0);
  
  return data;
};
