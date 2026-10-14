export const getImageUrl = (url?: string | null) => {
  if (!url) return 'https://via.placeholder.com/800x800?text=No+Image';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `${import.meta.env.VITE_UPLOADS_URL}${url}`;
  return url;
};
