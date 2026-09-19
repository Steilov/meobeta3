/**
 * Compresses an image file (e.g. from an <input type="file"> or drop zone)
 * to a high-quality WebP/JPEG data URL for storage and instant display.
 */
export async function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Выбранный файл не является изображением'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось декодировать изображение'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio downscaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Ошибка контекста canvas'));
          return;
        }

        // Draw and export
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
