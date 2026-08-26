import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { DEFAULT_LANG, SUPPORTED_LANGS, splitLangPrefix } from '@/lib/routes';
import { useCurrentLang } from '@/hooks/useLocalizedPath';
import { useSettings } from '@/hooks/useSettings';

interface Props {
  /** Sahifaga xos sarlavha. Bo'sh bo'lsa faqat institut nomi ko'rsatiladi. */
  title?: string;
  /** `<meta name="description">` uchun matn. */
  description?: string;
  /** Sahifa qidiruv tizimlarida indekslanmasin (masalan 404). */
  noindex?: boolean;
}

/**
 * Har bir ochiq sahifaning `<head>` qismi: `html lang`, `canonical` va
 * uchala til uchun `hreflang` (+ `x-default` → o'zbekcha).
 *
 * Asosiy manzil sozlamalardan (`site_url`) olinadi — kodga yozilmaydi.
 * Sozlama bo'sh bo'lsa, brauzerdagi joriy origin ishlatiladi.
 */
export default function SeoHead({ title, description, noindex }: Props) {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const { pathname } = useLocation();
  const { value } = useSettings();

  const configured = value('site_url');
  const fallback = typeof window === 'undefined' ? '' : window.location.origin;
  const base = (configured || fallback).replace(/\/+$/, '');

  const { rest } = splitLangPrefix(pathname);
  const suffix = rest === '/' ? '' : rest;
  const urlFor = (code: string) => `${base}/${code}${suffix}`;

  const siteName = t('common.institute_name');
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
      <link rel="canonical" href={urlFor(lang)} />
      {SUPPORTED_LANGS.map((code) => (
        <link key={code} rel="alternate" hrefLang={code} href={urlFor(code)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={urlFor(DEFAULT_LANG)} />

      {/* Ijtimoiy tarmoqlar — rasm to'liq manzil bilan berilishi shart */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:url" content={urlFor(lang)} />
      <meta property="og:image" content={`${base}/images/og-image.png`} />
      <meta property="og:locale" content={lang} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
