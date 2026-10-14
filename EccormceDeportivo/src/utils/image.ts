export const getImageUrl = (url?: string | null) => {
  if (!url) return 'https://via.placeholder.com/800x800?text=No+Image';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) {
    let rawUploads = import.meta.env.VITE_UPLOADS_URL || 'https://victoria-backend-api.onrender.com';
    if (rawUploads === 'victoria-backend-api' || !rawUploads.includes('.')) {
      rawUploads = 'https://victoria-backend-api.onrender.com';
    }
    const baseUrl = rawUploads.startsWith('http')
      ? rawUploads
      : (rawUploads.includes('.') ? `https://${rawUploads}` : `https://${rawUploads}.onrender.com`);
    return `${baseUrl.replace(/\/+$/, '')}${url}`;
  }
  return url;
};
