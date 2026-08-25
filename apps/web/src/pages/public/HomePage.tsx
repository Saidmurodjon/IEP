import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Beaker, BookOpen, Calendar, ChevronRight, Lightbulb, Zap,
} from 'lucide-react';
import { newsApi, pubsApi } from '@/lib/api';
import { format } from 'date-fns';
import type { Lang } from '@energetika/shared';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: newsData } = useQuery({
    queryKey: ['news', 'home'],
    queryFn: () => newsApi.list(1, 3),
  });

  const { data: pubsData } = useQuery({
    queryKey: ['publications', 'home'],
    queryFn: () => pubsApi.list(1, 4),
  });

  const news = newsData?.data?.data ?? [];
  const pubs = pubsData?.data?.data ?? [];

  const getTitle = (item: Record<string, string>) =>
    item[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ??
    item.titleUz ?? item.titleEn ?? '';

  const getSummary = (item: Record<string, string>) =>
    item[`summary${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ??
    item.summaryUz ?? item.summaryEn ?? '';

  const stats = [
    { value: '8+', label: t('home.stats_research'), icon: Lightbulb },
    { value: '12+', label: t('home.stats_labs'), icon: Beaker },
    { value: '500+', label: t('home.stats_publications'), icon: BookOpen },
    { value: '30+', label: t('home.stats_years'), icon: Calendar },
  ];

  return (
    <>
      <Helmet>
        <title>Energetika muammolari instituti</title>
        <meta name="description" content={t('home.hero_desc')} />
      </Helmet>

      {/* Hero — rasm + qoplama (yagona to'q seksiya) */}
      <section className="relative text-white overflow-hidden">
        <img
          src="/images/hero-solar.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Qoplama: chapdan o'ngga shaffoflashadi — matn chapda o'qiladi */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/85 via-primary-900/70 to-primary-900/30" />
        <div className="container relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-accent-300 text-sm font-medium mb-3 uppercase tracking-wider">
              {t('home.hero_title')}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {t('home.hero_subtitle')}
            </h1>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed max-w-2xl">
              {t('home.hero_desc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/about" className="btn bg-white text-primary-900 hover:bg-primary-50 font-semibold px-6 py-3">
                {t('home.learn_more')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link to="/contact" className="btn border border-white/50 text-white hover:bg-white/10 px-6 py-3">
                {t('nav.contact')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — yumshoq fon, oltin ikonkalar */}
      <section className="bg-primary-50 border-b border-primary-100">
        <div className="container py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="h-7 w-7 text-accent-500 mx-auto mb-2" strokeWidth={1.75} />
                <div className="text-3xl font-bold text-primary-800 mb-1">{value}</div>
                <div className="text-sm text-primary-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institut haqida qisqacha — matn + tasvir */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-accent-600 text-sm font-semibold uppercase tracking-wider mb-3">
                {t('home.about_kicker')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-5 leading-tight">
                {t('home.about_title')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">{t('home.about_p1')}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{t('home.about_p2')}</p>
              <Link to="/about" className="btn-primary px-6 py-3">
                {t('home.about_more')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="/images/about-wind.jpg"
                alt={t('home.about_img_alt')}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover rounded-xl shadow-sm border border-primary-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-primary-50/60">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-900">{t('home.news_title')}</h2>
              <div className="h-1 w-12 bg-accent-500 rounded mt-2" />
            </div>
            <Link
              to="/news"
              className="flex items-center gap-1 text-sm text-primary-700 hover:text-primary-900 font-medium"
            >
              {t('home.view_all')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {news.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('news.no_news')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item: Record<string, string>) => (
                <article key={item.id} className="card hover:shadow-md transition-shadow flex flex-col">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={getTitle(item)}
                      className="w-full aspect-[16/9] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] bg-primary-50 flex items-center justify-center">
                      <Zap className="h-10 w-10 text-primary-200" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <time className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.publishedAt), 'dd.MM.yyyy')}
                    </time>
                    <h3 className="font-semibold text-primary-900 mb-2 line-clamp-2">
                      {getTitle(item)}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {getSummary(item)}
                    </p>
                    <Link
                      to={`/news/${item.slug}`}
                      className="mt-auto text-sm text-primary-700 hover:text-primary-900 font-medium flex items-center gap-1"
                    >
                      {t('news.read_more')} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Publications */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-900">{t('home.publications_title')}</h2>
              <div className="h-1 w-12 bg-accent-500 rounded mt-2" />
            </div>
            <Link
              to="/publications"
              className="flex items-center gap-1 text-sm text-primary-700 hover:text-primary-900 font-medium"
            >
              {t('home.view_all')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {pubs.map((pub: Record<string, string | number>) => (
              <div key={pub.id as string} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors">
                <div className="flex-shrink-0 bg-primary-100 text-primary-700 rounded-lg p-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-primary-900 mb-1 line-clamp-1">
                    {getTitle(pub as Record<string, string>)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pub.authors as string} • {pub.year as number}
                    {pub.journal ? ` • ${pub.journal}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contact — engil fon, yagona to'q element: tugma */}
      <section className="py-16 bg-primary-50">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary-900">{t('home.contact_title')}</h2>
          <p className="text-primary-700 mb-8 max-w-xl mx-auto">
            {t('home.contact_desc')}
          </p>
          <Link to="/contact" className="btn bg-primary-800 text-white hover:bg-primary-900 px-8 py-3 font-semibold">
            {t('nav.contact')} <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
