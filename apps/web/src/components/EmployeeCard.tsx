import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, BookOpen } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import { telHref } from '@/hooks/useSettings';
import {
  initials, localized, orcidUrl, scopusUrl, type Employee,
} from '@/lib/employee';
import A11yImage from '@/components/A11yImage';

interface Props {
  employee: Employee;
  /** `extended` — rahbariyat va laboratoriya mudiri uchun kengaytirilgan kartochka. */
  variant?: 'compact' | 'extended';
  /** Kengaytirilgan kartochka ustidagi belgi, masalan "Laboratoriya mudiri". */
  badge?: string;
}

/**
 * Rasm bo'lmasa — ism bosh harflaridan to'rtburchak. Bo'sh joy qolmaydi.
 * Xodim surati rasmiy 3x4 (bo'yiga, portret) andozada — kartochkada ham
 * shu nisbat saqlanadi, eski nomutanosib rasmlar `object-cover` bilan
 * markazdan kesib ko'rsatiladi.
 */
function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const { t } = useTranslation();
  // O'lcham ramkada ANIQ beriladi — 3x4 sm (CSS `cm`, ≈113x151 px). Rasm
  // ramkani `h-full w-full` bilan to'ldiradi: `<img>` da faqat `aspect-ratio`
  // berilsa, brauzer rasmning o'z nisbatini ustun qo'yadi va 3x4 buziladi.
  // Ramka `overflow-hidden` — hover'da rasm kattalashganda chegaradan chiqmaydi.
  // Mobil'da rasm gradient lenta ustiga chiqib turadi (`-mt-12`).
  return (
    <div className="relative -mt-12 h-[4cm] w-[3cm] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-lg ring-4 ring-white sm:mt-0">
      {photoUrl ? (
        <A11yImage
          src={photoUrl}
          alt={`${name} — ${t('employee.photo_alt')}`}
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-3xl font-semibold text-primary-800"
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}

/**
 * Xodim kartochkasi. **To'ldirilmagan maydon umuman ko'rsatilmaydi** —
 * bo'sh joy yoki chiziqcha qolmaydi (06-topshiriq qabul mezoni).
 *
 * Mobil'da (`sm` dan tor) kartochka vertikal: tepada gradient lenta, surat
 * markazda uning ustiga chiqib turadi, matn markazlangan, aloqa havolalari
 * barmoq bilan bosishga qulay (kamida 44 px) tugmalar. `sm` dan boshlab
 * surat chapda, matn o'ngda; lenta ingichka chiziqqa aylanadi. 3 sm surat
 * 360 px ekranda matnga juda tor joy qoldirgani uchun yonma-yon joylashuv
 * faqat `sm` dan boshlanadi.
 */
export default function EmployeeCard({ employee, variant = 'compact', badge }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;
  const record = employee as unknown as Record<string, unknown>;

  const name = localized(record, 'fullName', lang);
  const position = localized(record, 'position', lang);
  const degree = localized(record, 'degree', lang);
  const academicTitle = localized(record, 'title', lang);
  const researchArea = localized(record, 'researchArea', lang);
  const reception = localized(record, 'receptionHours', lang);
  const credentials = [degree, academicTitle].filter(Boolean).join(', ');
  const extended = variant === 'extended';
  const at = employee.email?.lastIndexOf('@') ?? -1;
  const emailParts = employee.email && at > 0 ? [employee.email.slice(0, at), employee.email.slice(at + 1)] : null;

  const pill =
    'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium motion-safe:transition-colors sm:min-h-0 sm:w-auto sm:max-w-full sm:justify-start sm:px-3 sm:py-1';
  const badgeLink =
    'inline-flex min-h-[44px] items-center rounded-full border border-gray-200 px-4 text-xs font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-700 motion-safe:transition-colors sm:min-h-0 sm:px-2.5 sm:py-0.5';

  const links = (employee.email || (extended && employee.phone) || employee.orcid || employee.scopusId) && (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      {employee.email && (
        <a href={`mailto:${employee.email}`} className={`${pill} bg-primary-100 text-primary-800 hover:bg-primary-200`}>
          <Mail aria-hidden="true" className="h-4 w-4 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
          {/* Tor ekranda manzil `@` oldidan bo'linadi, so'z o'rtasidan emas. */}
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {emailParts ? <>{emailParts[0]}<wbr />@{emailParts[1]}</> : employee.email}
          </span>
        </a>
      )}
      {extended && employee.phone && (
        <a href={telHref(employee.phone)} className={`${pill} bg-primary-700 text-white hover:bg-primary-800`}>
          <Phone aria-hidden="true" className="h-4 w-4 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
          {employee.phone}
        </a>
      )}
      {employee.orcid && (
        <a href={orcidUrl(employee.orcid)} target="_blank" rel="noopener noreferrer" className={badgeLink}>
          ORCID
        </a>
      )}
      {employee.scopusId && (
        <a href={scopusUrl(employee.scopusId)} target="_blank" rel="noopener noreferrer" className={badgeLink}>
          Scopus
        </a>
      )}
    </div>
  );

  const research = researchArea && (
    <p className={`flex items-start justify-center gap-1.5 text-left sm:justify-start ${extended ? 'text-sm text-gray-600' : 'text-xs text-gray-500'}`}>
      <BookOpen aria-hidden="true" className={`mt-0.5 flex-shrink-0 text-primary-600 ${extended ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
      <span>
        {extended && <span className="text-gray-500">{t('employee.research_area')}: </span>}
        {researchArea}
      </span>
    </p>
  );

  return (
    <div className="card group flex flex-col motion-safe:transition-all motion-safe:duration-300 hover:border-primary-200 hover:shadow-xl md:hover:-translate-y-1">
      {/* Mobil'da surat ostidagi lenta, `sm` dan boshlab — yuqoridagi ingichka urg'u chizig'i. */}
      <div
        aria-hidden="true"
        className="relative h-20 flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 sm:h-1.5"
      >
        <div className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10 sm:hidden" />
        <div className="absolute left-6 top-8 h-12 w-12 rounded-full bg-white/5 sm:hidden" />
      </div>

      <div className={`flex flex-1 flex-col px-5 pb-6 sm:pt-5 ${extended ? 'sm:p-6' : 'sm:pb-5'}`}>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <Avatar name={name} photoUrl={employee.photoUrl} />
          <div className="w-full min-w-0 flex-1 sm:w-auto">
            {badge && (
              <span className="mb-2 inline-block rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-800">
                {badge}
              </span>
            )}
            <h3 className={`font-bold leading-snug text-gray-900 ${extended ? 'text-xl sm:text-lg' : 'text-lg sm:text-base sm:font-semibold'}`}>
              {name}
            </h3>
            <p className={`mt-1 text-sm ${extended ? 'font-medium text-primary-700' : 'text-gray-600'}`}>{position}</p>
            {credentials && (
              <p className={`mt-1 text-gray-500 ${extended ? 'text-sm' : 'text-xs'}`}>{credentials}</p>
            )}

            {/* Ixcham kartochkada qolgan ma'lumot ham shu ustunda (desktop'da surat yonida). */}
            {!extended && (research || links) && (
              <div className="mt-3 space-y-3">
                {research}
                {links}
              </div>
            )}
          </div>
        </div>

        {/*
          Kengaytirilgan kartochkada rasm faqat sarlavha qatori bilan yonma-yon —
          qolgan ma'lumot TO'LIQ kenglikda rasm TAGIDA. Avval hammasi rasm bilan
          bitta ustunda edi va rasm yuqori chap burchakda yolg'iz osilib qolardi.
        */}
        {extended && (
          <>
            {research && <div className="mt-5">{research}</div>}

            {employee.officeRoom && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
                <MapPin aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-primary-600" />
                <span>
                  <span className="text-gray-500">{t('employee.office')}: </span>
                  {employee.officeRoom}
                </span>
              </div>
            )}

            {links && <div className="mt-4">{links}</div>}

            {/*
              Qabul kunlari ATAYLAB ajratilgan — fuqarolar saytga aynan shu
              ma'lumot uchun kiradi (06-topshiriq, 4a-bo'lim).
            */}
            {reception && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-left">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-100">
                  <Clock aria-hidden="true" className="h-4 w-4 text-accent-800" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-accent-900">
                    {t('employee.reception')}
                  </div>
                  <div className="mt-0.5 text-sm text-gray-700">{reception}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
