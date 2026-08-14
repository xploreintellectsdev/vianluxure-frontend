export const blogsFields = [
  { name: 'blog_title', label: 'Blog Title', type: 'text', colSpan: 2, section: 'Basic Information', validation: { required: 'Title is required' } },
  { name: 'order_no', label: 'Display Order No', type: 'number', section: 'Basic Information', defaultValue: 0 },
  { name: 'published_date', label: 'Published Date', type: 'date', section: 'Basic Information' },
  { name: 'blog_image', label: 'Cover Image', type: 'image', colSpan: 2, section: 'Media', validation: { required: 'Please upload a cover image' } },
  { name: 'short_description', label: 'Short Summary / Excerpt', type: 'textarea', colSpan: 2, section: 'Content' },
  { name: 'blog_content', label: 'Full Blog Article Content (Markdown or Text)', type: 'textarea', colSpan: 2, section: 'Content' },
  { name: 'is_active', label: 'Active Status', checkboxLabel: 'Publish and show publicly on Blog Page', type: 'checkbox', section: 'Visibility', defaultValue: true },
];

export const mapBlogToFormData = (data) => ({
  blog_id: data.blog_id,
  blog_title: data.blog_title || '',
  order_no: data.order_no ?? 0,
  published_date: data.published_date ? data.published_date.toString().slice(0, 10) : '',
  blog_image: data.blog_image || null,
  short_description: data.short_description || '',
  blog_content: data.blog_content || '',
  is_active: !!data.is_active,
});

export const buildBlogPayload = (formValues) => {
  const formData = new FormData();
  
  formData.append('blog_title', formValues.blog_title || '');
  formData.append('order_no', formValues.order_no ?? 0);
  if (formValues.published_date) formData.append('published_date', formValues.published_date);
  formData.append('short_description', formValues.short_description || '');
  formData.append('blog_content', formValues.blog_content || '');
  formData.append('is_active', formValues.is_active ? 'true' : 'false');

  const img = formValues.blog_image;
  let actualFile = null;
  if (img instanceof File) actualFile = img;
  else if (img instanceof FileList && img.length > 0) actualFile = img[0];
  else if (Array.isArray(img) && img[0] instanceof File) actualFile = img[0];
  if (actualFile) formData.append('blog_image', actualFile);

  return formData;
};
