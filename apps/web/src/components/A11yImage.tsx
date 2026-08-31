import { useAccessibility } from '@/hooks/useAccessibility';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  /**
   * `alt` MAJBURIY. Bezak rasmda bo'sh satr beriladi — u holda rasmlar
   * o'chirilganda hech narsa ko'rsatilmaydi.
   */
  alt: string;
};

/**
 * Ochiq sahifalardagi rasmlar shu komponent orqali chiqariladi.
 *
 * Foydalanuvchi rasmlarni o'chirsa (`a11y.images = 'off'`): bezak rasmi
 * (`alt=""`) butunlay yo'qoladi, mazmunli rasm o'rniga uning tavsifi matn
 * sifatida chiqadi.
 */
export default function A11yImage({ alt, className, ...rest }: Props) {
  const { settings } = useAccessibility();

  if (settings.images === 'off') {
    if (!alt.trim()) return null;
    return <span className="a11y-alt">{alt}</span>;
  }

  return <img alt={alt} className={className} {...rest} />;
}
