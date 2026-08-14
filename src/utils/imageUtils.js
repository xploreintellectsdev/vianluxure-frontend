export const getImageUrl = (imagePath, folder = '') => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  let formattedPath = imagePath;
  // If the path doesn't start with a slash, and doesn't contain a slash, it's just a filename.
  // We can prepend the folder if provided, or just ensure it starts with a slash.
  if (!formattedPath.startsWith('/')) {
    if (!formattedPath.includes('/') && folder) {
      formattedPath = `/uploads/${folder}/${formattedPath}`;
    } else {
      formattedPath = `/${formattedPath}`;
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${formattedPath}`;
};
