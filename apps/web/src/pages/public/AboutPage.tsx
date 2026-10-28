import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Beaker, Users, GraduationCap, BookOpen, ChevronRight, Building2, ArrowRight } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LocalizedLink from '@/components/LocalizedLink';
import { aboutApi, structureApi } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import { flattenLabs, unitName, type Unit } from '@/lib/structure';
import { pick, isEmptyHtml, type AboutResponse } from '@/lib/about';

// Boy matn uchun qo'shimcha ko'rinish: bo'lim sarlavhasi chap chiziq bilan.
const CONTENT_CLASS =
  'prose-content text-gray-800 text-justify hyphens-auto [&_p:last-child]:mb-0 ' +
  '[&_h2:first-child]:mt-0 [&_h2]:border-l-4 [&_h2]:border-primary-600 [&_h2]:pl-3 [&_h2]:text-primary-900 ' +
  '[&_h3]:text-primary-900 [&_li]:marker:text-primary-600 ' +
  '[&_img]:mx-auto [&_img]:my-4 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: aboutRes, isLoading } = useQuery({ queryKey: ['about'], queryFn: () => aboutApi.get() });
  const { data: structureRes } = useQuery({ queryKey: ['structure'], queryFn: () => structureApi.tree() });

  const res = aboutRes?.data as AboutResponse | undefined;
  const labs = flattenLabs((structureRes?.data?.data ?? []) as Unit[]);

  const summary = pick(res?.data.summary, lang);
  const contentHtml = pick(res?.data.content, lang);
  const content = isEmptyHtml(contentHtml) ? '' : sanitizeHtml(contentHtml);

  // Raqamlar bazadan hisoblanadi (`GET /api/about`) — qo'lda kiritilmaydi.
  const stats = [
    { icon: Beaker, label: t('home.stats_labs'), value: res?.stats.labs },
    { icon: GraduationCap, label: t('home.stats_scientists'), value: res?.stats.scientists },
    { icon: Users, label: t('home.stats_staff'), value: res?.stats.employees },
    { icon: BookOpen, label: t('home.stats_publications'), value: res?.stats.publications },
  ];

  return (
    <>
      <SeoHead title={t('about.title')} description={summary || undefined} />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 pb-20 pt-12 text-white">
        <Building2 aria-hidden="true" className="absolute -bottom-10 -right-6 h-56 w-56 -rotate-6 text-white/10" />
        <div className="container relative">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-100">{t('common.academy')}</p>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{t('about.title')}</h1>
          {/* Yuklanayotganda eski statik matn chaqnab ketmasin — skeleton. */}
          {isLoading ? (
            <div aria-hidden="true" className="max-w-3xl space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-white/20" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/20" />
            </div>
          ) : (
            summary && <p className="max-w-3xl text-lg leading-relaxed text-primary-100">{summary}</p>
          )}
        </div>
      </div>

      <section aria-label={t('about.stats_label')} className="container relative -mt-12">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-busy={isLoading}>
          {stats.map(({ icon: Icon, label, value }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                {value === undefined ? (
                  <span aria-hidden="true" className="mb-1 block h-7 w-10 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="block text-2xl font-bold text-primary-900 sm:text-3xl">{value}</span>
                )}
                <span className="block text-sm text-gray-600">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            {isLoading ? (
              <div aria-hidden="true" className="space-y-3">
                <div className="mb-5 h-7 w-1/3 animate-pulse rounded bg-gray-200" />
                {['w-full', 'w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/5'].map((w, i) => (
                  <div key={i} className={`h-4 ${w} animate-pulse rounded bg-gray-100`} />
                ))}
              </div>
            ) : content ? (
              <div
                className={CONTENT_CLASS}
                // Server saqlashdan oldin tozalagan; bu ikkinchi qatlam (CLAUDE.md 4.1-7).
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              // Admin hali matn kiritmagan (yoki API xatosi) — mavjud rasmiy qisqa matn.
              <div className="space-y-4 leading-relaxed text-gray-800">
                <p>{t('about.mission_text')}</p>
                <p>{t('about.history_text')}</p>
                <p>{t('about.history_extra')}</p>
              </div>
            )}
          </article>

          {labs.length > 0 && (
            <aside aria-labelledby="about-labs" className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-200 bg-primary-50 px-5 py-4">
                  <Beaker className="h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
                  <h2 id="about-labs" className="font-semibold leading-snug text-primary-900">
                    {t('about.research_areas')}
                  </h2>
                </div>
                <ul className="divide-y divide-gray-100 p-2">
                  {labs.map((lab) => (
                    <li key={lab.id}>
                      <LocalizedLink
                        to={`/laboratories/${lab.id}`}
                        className="group flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                      >
                        <ChevronRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                        <span>{unitName(lab, lang)}</span>
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200 px-5 py-3">
                  <LocalizedLink
                    to="/laboratories"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900"
                  >
                    {t('home.view_all')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </LocalizedLink>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
