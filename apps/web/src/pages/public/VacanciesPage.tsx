import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, CalendarClock, Banknote, Mail, Phone, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { Lang, Vacancy } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { vacanciesApi } from '@/lib/api';
import { localized } from '@/lib/employee';
import { formatDate } from '@/lib/date';
import { sanitizeHtml } from '@/lib/sanitize';
import { CONTACT_INFO } from '@/config/contact';

/** Maosh matni: oraliq, bir tomonlama yoki «kelishilgan holda». */
function salaryText(v: Vacancy, lang: Lang, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const fmt = new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
  const { salaryFrom: from, salaryTo: to } = v;
  if (from != null && to != null) return t('vacancies.salary_range', { from: fmt.format(from), to: fmt.format(to) });
  if (from != null) return t('vacancies.salary_from', { from: fmt.format(from) });
  if (to != null) return t('vacancies.salary_to', { to: fmt.format(to) });
  return t('vacancies.salary_negotiable');
}

function VacancyCard({ vacancy, lang }: { vacancy: Vacancy; lang: Lang }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const record = vacancy as unknown as Record<string, unknown>;
  const title = localized(record, 'title', lang);
  const description = sanitizeHtml(localized(record, 'description', lang));
  const unitName = vacancy.unit ? localized(vacancy.unit as unknown as Record<string, unknown>, 'name', lang) : '';
  const email = vacancy.contactEmail || CONTACT_INFO.email;
  const phone = vacancy.contactPhone || CONTACT_INFO.phone;
  const panelId = `vacancy-${vacancy.id}`;

  return (
    <article className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 leading-snug min-w-0">{title}</h2>
        <span className="inline-flex items-center rounded-full bg-primary-100 text-primary-800 text-xs font-medium px-3 py-1">
          {t(`vacancies.type_${vacancy.employmentType}`)}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
        {unitName && (
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-0.5 text-primary-700 flex-shrink-0" aria-hidden="true" />
            <div><dt className="sr-only">{t('vacancies.unit')}</dt><dd>{unitName}</dd></div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Banknote className="h-4 w-4 mt-0.5 text-primary-700 flex-shrink-0" aria-hidden="true" />
          <div><dt className="sr-only">{t('vacancies.salary')}</dt><dd>{salaryText(vacancy, lang, t)}</dd></div>
        </div>
        {vacancy.deadline && (
          <div className="flex items-start gap-2">
            <CalendarClock className="h-4 w-4 mt-0.5 text-primary-700 flex-shrink-0" aria-hidden="true" />
            <div><dt className="sr-only">{t('vacancies.deadline')}</dt><dd>{t('vacancies.deadline')}: {formatDate(vacancy.deadline)}</dd></div>
          </div>
        )}
      </dl>

      {description && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
          >
            {open ? t('vacancies.hide_details') : t('vacancies.show_details')}
            <ChevronDown className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
          </button>
          <div
            id={panelId}
            hidden={!open}
            className="prose-content text-gray-800 mt-3 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      <div className="mt-5 rounded-lg bg-gray-50 border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900">{t('vacancies.how_to_apply')}</h3>
        <p className="text-sm text-gray-600 mt-1">{t('vacancies.apply_hint')}</p>
        <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6 text-sm">
          <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-primary-700 hover:underline break-all">
            <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">{t('vacancies.email')}:</span>{email}
          </a>
          <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 text-primary-700 hover:underline">
            <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">{t('vacancies.phone')}:</span>{phone}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function VacanciesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vacancies'],
    queryFn: () => vacanciesApi.list(),
  });
  const items: Vacancy[] = data?.data?.data ?? [];

  return (
    <>
      <SeoHead title={t('vacancies.title')} description={t('vacancies.subtitle')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('vacancies.title')}</h1>
          <p className="text-primary-200">{t('vacancies.subtitle')}</p>
        </div>
      </div>

      <div className="container py-10" aria-live="polite">
        {isLoading && <LoadingSpinner />}

        {isError && (
          <p role="alert" className="max-w-3xl mx-auto text-center text-red-700">{t('vacancies.error')}</p>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <EmptyState icon={Briefcase} title={t('vacancies.empty')} hint={t('vacancies.empty_hint')} />
          </div>
        )}

        <div className="space-y-4 max-w-3xl mx-auto">
          {items.map((v) => <VacancyCard key={v.id} vacancy={v} lang={lang} />)}
        </div>
      </div>
    </>
  );
}
