import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Beaker, CalendarDays, DoorOpen, Layers, Mail, Phone, User, Users,
} from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LocalizedLink from '@/components/LocalizedLink';
import EmployeeCard from '@/components/EmployeeCard';
import EmptyState from '@/components/EmptyState';
import A11yImage from '@/components/A11yImage';
import { useAccessibility } from '@/hooks/useAccessibility';
import { telHref } from '@/hooks/useSettings';
import { employeesApi, structureApi } from '@/lib/api';
import { localized, type Employee } from '@/lib/employee';
import { sanitizeHtml } from '@/lib/sanitize';
import { flattenLabs, unitName, type Unit } from '@/lib/structure';

export default function LabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { settings } = useAccessibility();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: structureData, isLoading } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'lab', id],
    queryFn: () => employeesApi.list({ labId: id }),
    enabled: !!id,
  });

  const lab = flattenLabs((structureData?.data?.data ?? []) as Unit[]).find((unit) => unit.id === id);
  const employees = (employeesData?.data?.data ?? []) as Employee[];
  // Mudir ro'yxatning boshida, kengaytirilgan kartochkada.
  const head = employees.find((employee) => employee.isUnitHead);
  const members = employees.filter((employee) => !employee.isUnitHead);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!lab) {
    return (
      <>
        <SeoHead title={t('lab.not_found')} noindex />
        <div className="container py-20 text-center">
          <h1 className="text-gray-700 mb-4">{t('lab.not_found')}</h1>
          <LocalizedLink to="/laboratories" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {t('lab.back')}
          </LocalizedLink>
        </div>
      </>
    );
  }

  const record = lab as unknown as Record<string, unknown>;
  const name = unitName(lab, lang);
  const summary = localized(record, 'description', lang);
  const directions = localized(record, 'directions', lang)
    .split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const content = sanitizeHtml(localized(record, 'content', lang));
  const hasContent = content.replace(/<[^>]*>/g, '').trim().length > 0 || /<img\s/i.test(content);
  const headName = head ? localized(head as unknown as Record<string, unknown>, 'fullName', lang) : '';
  const hasImage = !!lab.imageUrl && settings.images !== 'off';
  const hasContact = !!(headName || lab.room || lab.phone || lab.email);

  const stats: { icon: typeof Users; label: string }[] = [
    { icon: Users, label: `${employees.length} ${t('labs.staff')}` },
  ];
  if (lab.foundedYear) stats.push({ icon: CalendarDays, label: `${t('lab.founded')}: ${lab.foundedYear}` });
  if (directions.length > 0) stats.push({ icon: Layers, label: `${directions.length} ${t('lab.directions_unit')}` });

  return (
    <>
      <SeoHead title={name} description={summary || undefined} />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        {hasImage && (
          <>
            <A11yImage
              src={lab.imageUrl ?? undefined}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-primary-950/80" />
          </>
        )}
        <div className="container relative py-12 sm:py-16">
          <LocalizedLink
            to="/laboratories"
            className="inline-flex items-center gap-1 text-white/90 hover:text-white underline-offset-4 hover:underline text-sm mb-6"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {t('lab.back')}
          </LocalizedLink>
          <h1 className="text-3xl sm:text-4xl font-bold max-w-4xl leading-tight">{name}</h1>
          {summary && <p className="mt-4 max-w-3xl text-lg text-white/90 leading-relaxed">{summary}</p>}
          <ul className="mt-6 flex flex-wrap gap-3 list-none p-0">
            {stats.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-12 min-w-0">
            {directions.length > 0 && (
              <section aria-labelledby="lab-directions">
                <h2 id="lab-directions" className="text-2xl font-bold text-gray-900 mb-5">
                  {t('lab.directions')}
                </h2>
                <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 list-none p-0">
                  {directions.map((direction, index) => (
                    <li
                      key={direction}
                      className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md motion-reduce:transition-none"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-lg font-bold text-primary-800"
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900 leading-snug self-center">{direction}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {hasContent && (
              <section aria-labelledby="lab-about">
                <h2 id="lab-about" className="text-2xl font-bold text-gray-900 mb-5">{t('lab.about')}</h2>
                <div
                  className="prose-content text-gray-800"
                  // Server saqlashdan oldin tozalagan; bu ikkinchi qatlam (CLAUDE.md 4.1-7).
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </section>
            )}

            <section aria-labelledby="lab-staff">
              <h2 id="lab-staff" className="text-2xl font-bold text-gray-900 mb-5">{t('lab.staff_list')}</h2>

              {employees.length === 0 ? (
                <EmptyState icon={Users} title={t('lab.staff_empty')} hint={t('employees.empty_hint')} />
              ) : (
                <div className="space-y-5">
                  {head && <EmployeeCard employee={head} variant="extended" badge={t('employee.head')} />}
                  {members.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {members.map((employee) => (
                        <EmployeeCard key={employee.id} employee={employee} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {hasContact && (
            <aside aria-labelledby="lab-contact" className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 id="lab-contact" className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                  <Beaker aria-hidden="true" className="h-5 w-5 text-primary-700" />
                  {t('lab.contact')}
                </h2>
                <dl className="space-y-4 text-sm">
                  {headName && (
                    <div className="flex gap-3">
                      <User aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" />
                      <div>
                        <dt className="text-gray-600">{t('employee.head')}</dt>
                        <dd className="font-medium text-gray-900">{headName}</dd>
                      </div>
                    </div>
                  )}
                  {lab.room && (
                    <div className="flex gap-3">
                      <DoorOpen aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" />
                      <div>
                        <dt className="text-gray-600">{t('lab.room')}</dt>
                        <dd className="font-medium text-gray-900">{lab.room}</dd>
                      </div>
                    </div>
                  )}
                  {lab.phone && (
                    <div className="flex gap-3">
                      <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" />
                      <div>
                        <dt className="text-gray-600">{t('lab.phone')}</dt>
                        <dd>
                          <a href={telHref(lab.phone)} className="font-medium text-primary-700 hover:underline">
                            {lab.phone}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  {lab.email && (
                    <div className="flex gap-3">
                      <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" />
                      <div className="min-w-0">
                        <dt className="text-gray-600">{t('lab.email')}</dt>
                        <dd>
                          <a href={`mailto:${lab.email}`} className="break-all font-medium text-primary-700 hover:underline">
                            {lab.email}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
