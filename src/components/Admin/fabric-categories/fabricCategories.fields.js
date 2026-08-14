export const fabricCategoryFields = [
  { name: 'image', label: 'Category Image', type: 'image', colSpan: 2 },
  {
    name: 'name',
    label: 'Category Name',
    type: 'text',
    placeholder: 'e.g. Cotton, Linen, Silk',
    colSpan: 2,
    validation: {
      required: 'Category name is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildFabricCategoryPayload = (formValues) => {
  const formData = new FormData();
  formData.append('name', formValues.name.trim());

  // Only append if it's a NEW file — matches fabricFields' coverImage logic.
  // If it's a URL string (unchanged on edit), don't send it in this field;
  // backend keeps the existing fc_image via COALESCE.
  if (formValues.image instanceof File) {
    formData.append('image', formValues.image);
  }

  return formData;
};