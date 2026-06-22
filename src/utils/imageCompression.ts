/**
 * Client-side image compression utility for document uploads.
 * Restricts width to 1200px and reduces JPEG quality recursively to fit size constraints if needed.
 */
export interface CompressionResult {
  compressedFile: File;
  base64: string;
  originalSize: number;
  compressedSize: number;
}

export function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // Skip compression for PDF files
  if (file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          compressedFile: file,
          base64: reader.result as string,
          originalSize,
          compressedSize: originalSize
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(imageUrl);

      // Canvas dimensions calculations: Max width 1200px
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.7; // Start with 70% quality

      const tryCompression = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas export empty"));
              return;
            }

            // If resulting blob is larger than 2MB and we can still reduce quality
            if (blob.size > 2 * 1024 * 1024 && q > 0.3) {
              tryCompression(Math.max(q - 0.1, 0.3));
            } else {
              // Successfully compressed
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              // Convert to base64 for localState preservation
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  compressedFile,
                  base64: reader.result as string,
                  originalSize,
                  compressedSize: blob.size
                });
              };
              reader.onerror = (err) => reject(err);
              reader.readAsDataURL(compressedFile);
            }
          },
          'image/jpeg',
          q
        );
      };

      tryCompression(quality);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(imageUrl);
      reject(err);
    };

    img.src = imageUrl;
  });
}
