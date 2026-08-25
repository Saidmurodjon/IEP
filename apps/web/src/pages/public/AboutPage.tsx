import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Target, History, Beaker, Users, GraduationCap } from 'lucide-react';
import { structureApi } from '@/lib/api';
import { flattenLabs, unitName, INSTITUTE_STAFF, type Unit } from '@/lib/structure';
import type { Lang } from '@energetika/shared';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  // Raqamlar ham, yo'nalishlar ham rasmiy tuzilmadan olinadi — o'ylab topilmaydi.
  const { data } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });
  const labs = flattenLabs((data?.data?.data ?? []) as Unit[]);

  return (
    <>
      <Helmet>
        <title>{t('about.title')} | {t('common.institute_name')}</title>
      </Helmet>

      {/* Page hero */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('about.title')}</h1>
          <p className="text-primary-200">{t('common.academy')}</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">

          {/* Mission */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Target className="h-5 w-5 text-primary-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('about.mission')}</h2>
            </div>
            <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary-600">
              <p className="text-gray-700 leading-relaxed">
                {t('about.mission_text')}
              </p>
            </div>
          </section>

          {/* Key facts */}
          <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Beaker, label: t('home.stats_labs'), value: String(labs.length || INSTITUTE_STAFF.labs) },
                { icon: GraduationCap, label: t('home.stats_scientists'), value: String(INSTITUTE_STAFF.scientists) },
                { icon: Users, label: t('home.stats_staff'), value: String(INSTITUTE_STAFF.total) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-5 text-center">
                  <div className="bg-primary-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="text-2xl font-bold text-primary-700">{value}</div>
                  <div className="text-sm text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-100 p-2 rounded-lg">
                <History className="h-5 w-5 text-primary-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('about.history')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{t('about.history_text')}</p>
            <p className="text-gray-700 leading-relaxed">{t('about.history_extra')}</p>
          </section>

          {/* Research areas */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('about.research_areas')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labs.map((lab) => (
                <div key={lab.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-2 h-2 mt-1.5 bg-primary-600 rounded-full flex-shrink-0" />
                  <span className="text-sm text-gray-700">{unitName(lab, lang)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
