import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, BookOpen } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import { telHref } from '@/hooks/useSettings';
import {
  initials, localized, orcidUrl, scopusUrl, type Employee,
} from '@/lib/employee';

interface Props {
  employee: Employee;
  /** `extended` — rahbariyat va laboratoriya mudiri uchun kengaytirilgan kartochka. */
  variant?: 'compact' | 'extended';
  /** Kengaytirilgan kartochka ustidagi belgi, masalan "Laboratoriya mudiri". */
  badge?: string;
}

/** Rasm bo'lmasa — ism bosh harflaridan doira. Bo'sh joy qolmaydi. */
function Avatar({ name, photoUrl, size }: { name: string; photoUrl?: string | null; size: 'sm' | 'lg' }) {
  const { t } = useTranslation();
  const box = size === 'lg' ? 'h-24 w-24 text-2xl' : 'h-16 w-16 text-lg';
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${name} — ${t('employee.photo_alt')}`}
        className={`${box} rounded-full object-cover flex-shrink-0 bg-gray-100`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${box} rounded-full flex-shrink-0 bg-primary-100 text-primary-700 font-semibold flex items-center justify-center`}
    >
      {initials(name)}
    </div>
  );
}

/**
 * Xodim kartochkasi. **To'ldirilmagan maydon umuman ko'rsatilmaydi** —
 * bo'sh joy yoki chiziqcha qolmaydi (06-topshiriq qabul mezoni).
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

  const links = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {employee.email && (
        <a href={`mailto:${employee.email}`} className="inline-flex items-center gap-1.5 text-primary-700 hover:underline">
          <Mail className="h-3.5 w-3.5" />
          {employee.email}
        </a>
      )}
      {employee.orcid && (
        <a
          href={orcidUrl(employee.orcid)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-gray-500 hover:text-primary-700"
        >
          ORCID
        </a>
      )}
      {employee.scopusId && (
        <a
          href={scopusUrl(employee.scopusId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-gray-500 hover:text-primary-700"
        >
          Scopus
        </a>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="card p-5 flex items-start gap-4">
        <Avatar name={name} photoUrl={employee.photoUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 leading-snug">{name}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{position}</p>
          {credentials && <p className="text-xs text-gray-400 mt-1">{credentials}</p>}
          {researchArea && (
            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
              <BookOpen className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-300" />
              {researchArea}
            </p>
          )}
          <div className="mt-3">{links}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <Avatar name={name} photoUrl={employee.photoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          {badge && (
            <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full bg-accent-100 text-accent-800 text-xs font-medium">
              {badge}
            </span>
          )}
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{name}</h3>
          <p className="text-sm text-primary-700 font-medium mt-1">{position}</p>
          {credentials && <p className="text-sm text-gray-500 mt-1">{credentials}</p>}
          {researchArea && (
            <p className="text-sm text-gray-600 mt-3 flex items-start gap-2">
              <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-300" />
              <span>
                <span className="text-gray-400">{t('employee.research_area')}: </span>
                {researchArea}
              </span>
            </p>
          )}

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            {employee.officeRoom && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-300 flex-shrink-0" />
                <span>
                  <span className="text-gray-400">{t('employee.office')}: </span>
                  {employee.officeRoom}
                </span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-300 flex-shrink-0" />
                <a href={telHref(employee.phone)} className="text-primary-700 hover:underline">
                  {employee.phone}
                </a>
              </div>
            )}
          </div>

          <div className="mt-3">{links}</div>

          {/*
            Qabul kunlari ATAYLAB ajratilgan — fuqarolar saytga aynan shu
            ma'lumot uchun kiradi (06-topshiriq, 4a-bo'lim).
          */}
          {reception && (
            <div className="mt-4 rounded-lg bg-accent-50 border border-accent-200 p-3 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-accent-700 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-accent-900 uppercase tracking-wide">
                  {t('employee.reception')}
                </div>
                <div className="text-sm text-gray-700 mt-0.5">{reception}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
