// Canlı veya yerel ortam backend sunucu adresi
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://partyhub-azc1.onrender.com');
