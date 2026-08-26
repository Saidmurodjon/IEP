import { ClientError } from '@/lib/api-error';

/**
 * Rasmni yuklashdan OLDIN brauzerda tayyorlash.
 *
 * Moderator odatda telefonda olingan 8 MB lik rasmni yuklaydi. Uni o'sha
 * holicha yuborish sayt tezligini buzadi, shuning uchun `canvas` orqali
 * kichraytiriladi va WebP ga o'giriladi.
 */

/** Umumiy rasmlar uchun eng katta kenglik. */
export const MAX_WIDTH_DEFAULT = 1920;
/** Xodim rasmi uchun eng katta kenglik. */
export const MAX_WIDTH_PHOTO = 800;
/** Xodim rasmi uchun eng kichik kenglik — juda kichik rasm kartochkada xunuk. */
export const MIN_WIDTH_PHOTO = 200;

const QUALITY = 0.85;

/** Xato xabarida ko'rsatiladigan formatlar — server ro'yxati bilan bir xil. */
const ALLOWED_FORMATS = 'JPEG, PNG, WebP';

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
  /** Kichraytirish bo'lgan bo'lsa — foydalanuvchiga ko'rsatiladigan ma'lumot. */
  resized?: { fromWidth: number; toWidth: number; beforeBytes: number; afterBytes: number };
}

/** `412 KB`, `7,8 MB` ko'rinishida. O'zbekchada kasr vergul bilan yoziladi. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      // Brauzer faylni rasm sifatida ocholmadi — demak bu rasm emas
      // (masalan kengaytmasi o'zgartirilgan `.exe`). Foydalanuvchiga
      // "serverda xatolik" emas, aniq sabab ko'rsatilishi kerak.
      reject(new ClientError('UNSUPPORTED_TYPE', { formats: ALLOWED_FORMATS }));
    };
    image.src = url;
  });
}

/** Brauzer WebP ga chiqara oladimi. Yo'q bo'lsa JPEG ishlatiladi. */
function supportsWebp(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ClientError('UPLOAD_FAILED'))),
      type,
      QUALITY
    );
  });
}

/**
 * Rasmni kichraytiradi va WebP (yoki JPEG) ga o'giradi.
 *
 * @throws `IMAGE_TOO_SMALL` — `minWidth` dan kichik bo'lsa.
 */
export async function prepareImage(
  file: File,
  options: { maxWidth?: number; minWidth?: number } = {}
): Promise<PreparedImage> {
  const maxWidth = options.maxWidth ?? MAX_WIDTH_DEFAULT;
  const minWidth = options.minWidth ?? 0;

  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (minWidth > 0 && sourceWidth < minWidth) {
    throw new ClientError('IMAGE_TOO_SMALL', { min: minWidth });
  }

  // SVG va o'lchamsiz rasmlar: `naturalWidth` 0 bo'lishi mumkin. Bunday
  // faylni kichraytirib bo'lmaydi va u qabul qilinmaydi.
  if (sourceWidth === 0 || sourceHeight === 0) {
    throw new ClientError('UNSUPPORTED_TYPE', { formats: ALLOWED_FORMATS });
  }

  // Kichraytirish shart bo'lmasa — faylni o'zgartirmasdan qaytaramiz.
  if (sourceWidth <= maxWidth) {
    return { file, width: sourceWidth, height: sourceHeight };
  }

  const scale = maxWidth / sourceWidth;
  const width = maxWidth;
  const height = Math.round(sourceHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new ClientError('UPLOAD_FAILED');
  context.drawImage(image, 0, 0, width, height);

  const type = supportsWebp() ? 'image/webp' : 'image/jpeg';
  const blob = await toBlob(canvas, type);
  const extension = type === 'image/webp' ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

  return {
    file: new File([blob], `${baseName}.${extension}`, { type }),
    width,
    height,
    resized: {
      fromWidth: sourceWidth,
      toWidth: width,
      beforeBytes: file.size,
      afterBytes: blob.size,
    },
  };
}
