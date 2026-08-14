export const eventsFields = [
  { name: 'event_title', label: 'Event Title', type: 'text', colSpan: 2, section: 'Event Details', validation: { required: 'Event title is required' } },
  { name: 'order_no', label: 'Display Order No', type: 'number', section: 'Event Details', defaultValue: 0 },
  { name: 'event_date', label: 'Event Date', type: 'date', section: 'Event Details' },
  { 
    name: 'media_type', 
    label: 'Media Type', 
    type: 'select', 
    section: 'Media',
    options: [
      { value: 'Image', label: 'Image' },
      { value: 'Video', label: 'Video' }
    ],
    defaultValue: 'Image'
  },
  { name: 'event_media', label: 'Event Media (Image or MP4 Video)', type: 'media', colSpan: 2, section: 'Media', validation: { required: 'Please upload event media' } },
  { name: 'short_description', label: 'Description / Event Highlights', type: 'textarea', colSpan: 2, section: 'Content' },
  { name: 'is_active', label: 'Active Status', checkboxLabel: 'Publish and show publicly on Events Page', type: 'checkbox', section: 'Visibility', defaultValue: true },
];

export const mapEventToFormData = (data) => ({
  event_id: data.event_id,
  event_title: data.event_title || '',
  order_no: data.order_no ?? 0,
  event_date: data.event_date ? data.event_date.toString().slice(0, 10) : '',
  media_type: data.media_type || 'Image',
  event_media: data.event_media || null,
  short_description: data.short_description || '',
  is_active: !!data.is_active,
});

export const buildEventPayload = (formValues) => {
  const formData = new FormData();
  
  formData.append('event_title', formValues.event_title || '');
  formData.append('order_no', formValues.order_no ?? 0);
  if (formValues.event_date) formData.append('event_date', formValues.event_date);
  
  const mediaTypeVal = formValues.media_type?.value !== undefined ? formValues.media_type.value : (formValues.media_type || 'Image');
  formData.append('media_type', mediaTypeVal);
  
  formData.append('short_description', formValues.short_description || '');
  formData.append('is_active', formValues.is_active ? 'true' : 'false');

  const media = formValues.event_media;
  let actualFile = null;
  if (media instanceof File) actualFile = media;
  else if (media instanceof FileList && media.length > 0) actualFile = media[0];
  else if (Array.isArray(media) && media[0] instanceof File) actualFile = media[0];
  if (actualFile) formData.append('event_media', actualFile);

  return formData;
};
