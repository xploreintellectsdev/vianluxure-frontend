export const customStyleFields = (typeLabel) => [
  { name: 'name', label: `${typeLabel} Name`, type: 'text', colSpan: 2, validation: { required: 'Name is required' } },
  { name: 'price', label: 'Price (₹)', type: 'number', validation: { required: 'Price is required' } },
  { name: 'image', label: `${typeLabel} Image`, type: 'image', colSpan: 2 }
];

export const mapCustomStyleToFormData = (data) => ({
  option_id: data.option_id,
  name: data.option_name,
  price: data.option_price,
  image: data.option_image || null,
});

export const buildCustomStylePayload = (formValues) => {
  const formData = new FormData();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  formData.append('name', formValues.name.trim());
  formData.append('price', formValues.price);

  const img = formValues.image;
  let actualFile = null;
  if (img instanceof File) actualFile = img;
  else if (img instanceof FileList && img.length > 0) actualFile = img[0];
  else if (Array.isArray(img) && img[0] instanceof File) actualFile = img[0];
  else if (img && img.file instanceof File) actualFile = img.file;
  else if (img && img.originFileObj instanceof File) actualFile = img.originFileObj;

  if (actualFile) {
    formData.append('image', actualFile);
  } else if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) {
    formData.append('image', img.replace(API_URL, ''));
  }

  return formData;
};