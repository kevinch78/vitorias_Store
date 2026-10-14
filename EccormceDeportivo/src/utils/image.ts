export const getImageUrl = (url?: string | null) => {
  if (!url) return 'https://via.placeholder.com/800x800?text=No+Image';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) {
    const rawUploads = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000';
    const baseUrl = rawUploads.startsWith('http') ? rawUploads : `https://${rawUploads}`;
    return `${baseUrl.replace(/\/+$/, '')}${url}`;
  }
  return url;
};
