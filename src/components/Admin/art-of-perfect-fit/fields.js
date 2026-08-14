export const stepFields = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Enter step title'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter step description'
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      placeholder: 'Enter display order (e.g., 1)'
    },
    {
      name: 'image',
      label: 'Image',
      type: 'image',
      required: false,
      accept: 'image/*'
    }
  ];
  
  export const mapStepToFormData = (step) => ({
    step_id: step.step_id,
    title: step.title || '',
    description: step.description || '',
    display_order: step.display_order || 0,
    image: step.image_url || null,
  });
  
  export const buildStepPayload = (formData) => {
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('display_order', formData.display_order);
    
    if (formData.image instanceof File) {
      payload.append('image', formData.image);
    }
    
    return payload;
  };
