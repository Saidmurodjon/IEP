import { useState } from 'react';
import A11yImage from '@/components/A11yImage';
import { useAccessibility } from '@/hooks/useAccessibility';

type Props = {
  src: string;
  alt: string;
  /** Kartadagi ramka o'lchami, masalan `aspect-[16/9]` yoki `h-48`. */
  frameClassName?: string;
  /** `card` — ro'yxatdagi karta, `detail` — yangilikning o'z sahifasi. */
  variant?: 'card' | 'detail';
};

/**
 * Yangilik muqovasi. Tik (portret) rasm — masalan, himoya e'lonidagi talabgor
 * fotosi — 16:9 ramkada kesilib, boshi ko'rinmay qoladi. Shuning uchun rasm
 * yuklangach o'lchami tekshiriladi va portret bo'lsa tik ramkadagi foto sifatida
 * ko'rsatiladi (3:4, kesilmaydi). Gorizontal rasmlar avvalgidek butun ramkani to'ldiradi.
 */
export default function NewsCover({ src, alt, frameClassName = 'aspect-[16/9]', variant = 'card' }: Props) {
  const { settings } = useAccessibility();
  const [portrait, setPortrait] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setPortrait(naturalHeight > naturalWidth * 1.05);
  };

  // Rasmlar o'chirilgan bo'lsa ramka kerak emas — A11yImage o'zi tavsifni chiqaradi.
  if (settings.images === 'off') return <A11yImage src={src} alt={alt} />;

  if (variant === 'detail') {
    return (
      <A11yImage
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className={
          portrait
            ? 'block w-48 sm:w-60 aspect-[3/4] mx-auto mb-8 rounded-xl object-cover object-top shadow-md'
            : 'w-full rounded-xl mb-8 shadow-sm'
        }
      />
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${frameClassName} ${portrait ? 'bg-gradient-to-br from-primary-50 to-primary-100' : ''}`}>
      <A11yImage
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className={
          portrait
            ? 'absolute left-1/2 top-1/2 h-[84%] aspect-[3/4] -translate-x-1/2 -translate-y-1/2 rounded-lg object-cover object-top ring-4 ring-white shadow-md'
            : 'w-full h-full object-cover'
        }
      />
    </div>
  );
}
