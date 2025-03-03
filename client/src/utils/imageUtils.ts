/**
 * Resim URL'sini düzgün şekilde işler ve doğru URL formatını döndürür.
 * @param imageUrl - İşlenecek orijinal resim URL'si
 * @returns Düzgün işlenmiş resim URL'si
 */
export const processImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/images/korku1.jpg';
  
  // Eğer URL tam bir http:// veya https:// ile başlıyorsa olduğu gibi kullan
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Eğer URL '/stories/...' gibi bir yol ise, veritabanından alınan resimleri doğru şekilde çek
  if (imageUrl.startsWith('/')) {
    return `http://localhost:3001${imageUrl}`;
  }
  
  // Varsayılan korku resmi
  return 'https://sm.ign.com/t/ign_tr/news/f/fourth-gra/fourth-graders-distraught-after-winnie-the-pooh-blood-and-ho_3z5p.1280.jpg';
};

/**
 * Veritabanı için resim URL'si oluşturur.
 * @param file - Yüklenecek dosya
 * @returns Promise<string> - Resim URL'si
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Gerçek projede bu kısmı sunucuya dosya yükleme işlemi ile değiştirin
    // Şimdilik dosyayı base64'e çevirip döndürelim
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Base64 yerine gerçek URL döndürülebilir
          resolve(reader.result);
        } else {
          reject(new Error('Dosya okunamadı'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    return 'https://sm.ign.com/t/ign_tr/news/f/fourth-gra/fourth-graders-distraught-after-winnie-the-pooh-blood-and-ho_3z5p.1280.jpg';
  }
}; 