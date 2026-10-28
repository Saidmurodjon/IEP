import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, BookOpen } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import { telHref } from '@/hooks/useSettings';
import { initials, localized, orcidUrl, scopusUrl, type Employee } from '@/lib/employee';
import A11yImage from '@/components/A11yImage';

interface Props {
  employee: Employee;
  /** Direktor kartochkasi — kengroq, surat kattaroq, sahifa markazida. */
  featured?: boolean;
}

/** Ma'lumot qatori: ikonka + yorliq + qiymat. Bo'sh qiymat chaqirilmaydi. */
function Row({ icon: Icon, label, wide, children }: { icon: typeof Mail; label: string; wide: boolean; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" />
      <div className="min-w-0 flex-1 sm:flex sm:gap-3">
        <dt className={`text-sm text-gray-500 sm:flex-shrink-0 ${wide ? 'sm:w-40' : 'sm:w-28'}`}>{label}</dt>
        <dd className="text-sm text-gray-800 [overflow-wrap:anywhere]">{children}</dd>
      </div>
    </div>
  );
}

/**
 * Rahbariyat kartochkasi — rasmiy uslub: tekis fon, yuqorida to'q chiziq,
 * lavozim sarlavha ustida, ma'lumot jadval ko'rinishidagi qatorlarda.
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
  const photoSize = featured ? 'h-[5.2cm] w-[3.9cm]' : 'h-[4cm] w-[3cm]';

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-primary-800 bg-white shadow-sm ${featured ? 'sm:flex-row' : ''}`}
    >
      <div
        className={`flex flex-shrink-0 justify-center bg-gray-50 p-6 ${featured ? 'sm:border-r sm:border-gray-200 sm:p-8' : 'border-b border-gray-200'}`}
      >
        <div className={`${photoSize} overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200`}>
          {employee.photoUrl ? (
            <A11yImage
              src={employee.photoUrl}
              alt={`${name} — ${t('employee.photo_alt')}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-primary-100 text-3xl font-semibold text-primary-800"
            >
              {initials(name)}
            </div>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col p-6 ${featured ? 'sm:p-8' : ''}`}>
        <header className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">{position}</p>
          <h2 className={`mt-2 font-bold leading-snug text-gray-900 ${featured ? 'text-2xl' : 'text-xl'}`}>{name}</h2>
          {credentials && <p className="mt-1 text-sm text-gray-600">{credentials}</p>}
        </header>

        {hasRows && (
          <dl className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
            {researchArea && (
              <Row icon={BookOpen} wide={featured} label={t('employee.research_area')}>{researchArea}</Row>
            )}
            {employee.officeRoom && (
              <Row icon={MapPin} wide={featured} label={t('employee.office')}>{employee.officeRoom}</Row>
            )}
            {employee.email && (
              <Row icon={Mail} wide={featured} label={t('employee.email')}>
                <a href={`mailto:${employee.email}`} className={link}>{employee.email}</a>
              </Row>
            )}
            {employee.phone && (
              <Row icon={Phone} wide={featured} label={t('employee.phone')}>
                <a href={telHref(employee.phone)} className={link}>{employee.phone}</a>
              </Row>
            )}
          </dl>
        )}

        {(employee.orcid || employee.scopusId) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {employee.orcid && (
              <a href={orcidUrl(employee.orcid)} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-800 sm:min-h-0 sm:py-1">
                ORCID
              </a>
            )}
            {employee.scopusId && (
              <a href={scopusUrl(employee.scopusId)} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-800 sm:min-h-0 sm:py-1">
                Scopus
              </a>
            )}
          </div>
        )}

        {/* Qabul kunlari ajratilgan — fuqarolar saytga aynan shu ma'lumot uchun kiradi. */}
        {reception && (
          <div className="mt-auto pt-5">
            <div className="flex items-start gap-3 rounded-md border-l-4 border-accent-500 bg-accent-50 px-4 py-3">
              <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-800" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-accent-900">
                  {t('employee.reception')}
                </div>
                <div className="mt-0.5 text-sm text-gray-800">{reception}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
