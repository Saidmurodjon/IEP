import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, BookOpen } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import { telHref } from '@/hooks/useSettings';
import { initials, localized, orcidUrl, scopusUrl, type Employee } from '@/lib/employee';
import A11yImage from '@/components/A11yImage';

interface Props {
  employee: Employee;
  /** Direktor kartochkasi — surat biroz kattaroq, sahifa markazida. */
  featured?: boolean;
}

/**
 * Ma'lumot qatori: ikonka + qiymat. Yorliq ekran o'qigichlar uchun saqlanadi
 * (`dt`), ko'zga faqat `showLabel` bo'lsa ko'rinadi — ixchamlik uchun.
 */
function Row({ icon: Icon, label, showLabel = false, children }: {
  icon: typeof Mail; label: string; showLabel?: boolean; children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" />
      <dt className={showLabel ? 'flex-shrink-0 text-gray-500' : 'sr-only'}>{label}</dt>
      <dd className="min-w-0 text-gray-800 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

/**
 * Rahbariyat kartochkasi — rasmiy, ixcham: yuqorida to'q chiziq, surat chapda
 * (mobil'da tepada), lavozim ism ustida, aloqa ma'lumoti zich qatorlarda.
 * To'ldirilmagan maydon ko'rsatilmaydi. Surat 3x4 nisbatda.
 */
export default function LeaderCard({ employee, featured = false }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;
  const record = employee as unknown as Record<string, unknown>;

  const name = localized(record, 'fullName', lang);
  const position = localized(record, 'position', lang);
  const credentials = [localized(record, 'degree', lang), localized(record, 'title', lang)]
    .filter(Boolean)
    .join(', ');
  const researchArea = localized(record, 'researchArea', lang);
  const reception = localized(record, 'receptionHours', lang);
  const hasRows = researchArea || employee.officeRoom || employee.email || employee.phone;

  const link = 'text-primary-800 underline-offset-2 hover:text-primary-900 hover:underline';
  const idLink =
    'inline-flex min-h-[44px] items-center rounded border border-gray-300 px-2 text-xs font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-800 sm:min-h-0 sm:py-0.5';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-primary-800 bg-white shadow-sm sm:flex-row">
      {/*
        Surat kartochka chetiga yopishgan, chap ustun kartochka bo'yi bo'ylab
        davom etadi — surat ostida bo'sh oq joy qolib, ajralib turmaydi.
        O'lcham rasmiy 3x4 sm (CSS `cm`), mobil'da markazda tepada.
      */}
      <div className="flex-shrink-0 pt-4 sm:border-r sm:border-gray-200 sm:bg-gray-50 sm:pt-0">
        <div className="mx-auto h-[4cm] w-[3cm] overflow-hidden rounded-md bg-gray-100 sm:rounded-none">
          {employee.photoUrl ? (
            <A11yImage
              src={employee.photoUrl}
              alt={`${name} — ${t('employee.photo_alt')}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-semibold text-primary-800"
            >
              {initials(name)}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <header className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">{position}</p>
          <h2 className={`mt-1 font-bold leading-snug text-gray-900 ${featured ? 'text-xl' : 'text-lg'}`}>{name}</h2>
          {credentials && <p className="text-sm text-gray-600">{credentials}</p>}
        </header>

        {hasRows && (
          <dl className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
            {researchArea && (
              <Row icon={BookOpen} label={t('employee.research_area')} showLabel={featured}>{researchArea}</Row>
            )}
            {employee.officeRoom && (
              <Row icon={MapPin} label={t('employee.office')} showLabel>{employee.officeRoom}</Row>
            )}
            {employee.email && (
              <Row icon={Mail} label={t('employee.email')}>
                <a href={`mailto:${employee.email}`} className={link}>{employee.email}</a>
              </Row>
            )}
            {employee.phone && (
              <Row icon={Phone} label={t('employee.phone')}>
                <a href={telHref(employee.phone)} className={link}>{employee.phone}</a>
              </Row>
            )}
          </dl>
        )}

        {(employee.orcid || employee.scopusId) && (
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {employee.orcid && (
              <a href={orcidUrl(employee.orcid)} target="_blank" rel="noopener noreferrer" className={idLink}>ORCID</a>
            )}
            {employee.scopusId && (
              <a href={scopusUrl(employee.scopusId)} target="_blank" rel="noopener noreferrer" className={idLink}>Scopus</a>
            )}
          </div>
        )}

        {/* Qabul kunlari ajratilgan — fuqarolar saytga aynan shu ma'lumot uchun kiradi. */}
        {reception && (
          <div className="mt-auto pt-3">
            <p className="flex items-start gap-2 rounded border-l-4 border-accent-500 bg-accent-50 px-3 py-2 text-sm">
              <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-800" />
              <span>
                <span className="mr-2 font-semibold text-accent-900">{t('employee.reception')}</span>
                <span className="text-gray-800">{reception}</span>
              </span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
