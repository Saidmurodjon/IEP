import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Beaker, Users, GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LocalizedLink from '@/components/LocalizedLink';
import { aboutApi, structureApi } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import { flattenLabs, unitName, type Unit } from '@/lib/structure';
import { pick, isEmptyHtml, type AboutResponse } from '@/lib/about';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: aboutRes } = useQuery({ queryKey: ['about'], queryFn: () => aboutApi.get() });
  const { data: structureRes } = useQuery({ queryKey: ['structure'], queryFn: () => structureApi.tree() });

  const res = aboutRes?.data as AboutResponse | undefined;
  const labs = flattenLabs((structureRes?.data?.data ?? []) as Unit[]);

  const summary = pick(res?.data.summary, lang);
  const contentHtml = pick(res?.data.content, lang);
  const content = isEmptyHtml(contentHtml) ? '' : sanitizeHtml(contentHtml);

  // Raqamlar bazadan hisoblanadi (`GET /api/about`) — qo'lda kiritilmaydi.
  const stats = res
    ? [
        { icon: Beaker, label: t('home.stats_labs'), value: res.stats.labs },
        { icon: GraduationCap, label: t('home.stats_scientists'), value: res.stats.scientists },
        { icon: Users, label: t('home.stats_staff'), value: res.stats.employees },
        { icon: BookOpen, label: t('home.stats_publications'), value: res.stats.publications },
      ]
    : [];

  return (
    <>
      <SeoHead title={t('about.title')} description={summary || undefined} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 py-12 text-white">
        <div className="container">
          <h1 className="mb-3 text-3xl font-bold">{t('about.title')}</h1>
          <p className="max-w-3xl leading-relaxed text-primary-100">{summary || t('common.academy')}</p>
        </div>
      </div>

      {stats.length > 0 && (
        <section aria-label={t('about.stats_label')} className="border-b border-gray-200 bg-white">
          <ul className="container grid grid-cols-2 divide-gray-200 lg:grid-cols-4 lg:divide-x">
            {stats.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-4 px-2 py-6 lg:px-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-2xl font-bold text-primary-900">{value}</span>
                  <span className="block text-sm text-gray-600">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="container py-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article>
            {content ? (
              <div
                className="prose-content text-gray-800 text-justify hyphens-auto [&_p:last-child]:mb-0 [&_img]:mx-auto [&_img]:my-4 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl"
                // Server saqlashdan oldin tozalagan; bu ikkinchi qatlam (CLAUDE.md 4.1-7).
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              // Admin hali matn kiritmagan — mavjud rasmiy qisqa matn.
              <div className="space-y-4 leading-relaxed text-gray-800">
                <p>{t('about.mission_text')}</p>
                <p>{t('about.history_text')}</p>
                <p>{t('about.history_extra')}</p>
              </div>
            )}
          </article>

          {labs.length > 0 && (
            <aside aria-labelledby="about-labs" className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 id="about-labs" className="mb-4 font-semibold text-gray-900">{t('about.research_areas')}</h2>
                <ul className="space-y-1">
                  {labs.map((lab) => (
                    <li key={lab.id}>
                      <LocalizedLink
                        to={`/laboratories/${lab.id}`}
                        className="group flex items-start gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-white hover:text-primary-800"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                        <span>{unitName(lab, lang)}</span>
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
