// Canlı veya yerel ortam backend sunucu adresi
// Render üzerinde servis oluşturduğunuzda aldığınız adresi buraya veya .env VITE_SERVER_URL içine yazabilirsiniz.
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://partihub-server.onrender.com');
