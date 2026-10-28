import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  Target, Eye, Beaker, Users, GraduationCap, BookOpen, ArrowRight, ArrowUpRight,
  CalendarDays, Landmark, Network, Mail,
} from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LocalizedLink from '@/components/LocalizedLink';
import { aboutApi, structureApi } from '@/lib/api';
import { flattenLabs, unitName, INSTITUTE_STAFF, type Unit } from '@/lib/structure';
import { VALUE_ICON_MAP, pick, paragraphs, type AboutResponse } from '@/lib/about';

/** Foydalanuvchi harakatni kamaytirishni so'raganmi (OS sozlamasi). */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Element ekranga kirganini bir marta aniqlaydi. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

/** Ekranga kirganda yumshoq paydo bo'lish. Harakat o'chirilgan bo'lsa — darhol ko'rinadi. */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={clsx(
        'motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out',
        inView ? 'opacity-100 translate-y-0' : 'motion-safe:opacity-0 motion-safe:translate-y-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Raqamni 0 dan sanab chiqadi. Ekran o'quvchi faqat yakuniy qiymatni eshitadi. */
function CountUp({ value }: { value: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

function SectionHeading({ eyebrow, title, id, light }: { eyebrow: string; title: string; id: string; light?: boolean }) {
  return (
    <div className="mb-10">
      <p className={clsx('mb-2 text-sm font-semibold uppercase tracking-[0.2em]', light ? 'text-accent-300' : 'text-accent-700')}>
        {eyebrow}
      </p>
      <h2 id={id} className={clsx('text-3xl font-bold tracking-tight sm:text-4xl', light ? 'text-white' : 'text-gray-900')}>
        {title}
      </h2>
    </div>
  );
}

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: aboutRes } = useQuery({ queryKey: ['about'], queryFn: () => aboutApi.get() });
  const { data: structureRes } = useQuery({ queryKey: ['structure'], queryFn: () => structureApi.tree() });

  const about = (aboutRes?.data as AboutResponse | undefined)?.data;
  const live = (aboutRes?.data as AboutResponse | undefined)?.live;
  const labs = flattenLabs((structureRes?.data?.data ?? []) as Unit[]);

  // Admin to'ldirmagan maydonlar uchun — mavjud rasmiy matnlar (i18n).
  const tagline = pick(about?.tagline, lang) || t('common.academy');
  const intro = pick(about?.intro, lang);
  const mission = pick(about?.mission, lang) || t('about.mission_text');
  const vision = pick(about?.vision, lang);
  const historyText = pick(about?.history, lang);
  const history = historyText ? paragraphs(historyText) : [t('about.history_text'), t('about.history_extra')];
  const milestones = about?.milestones ?? [];
  const values = about?.values ?? [];
  const foundedYear = about?.foundedYear ?? null;

  const stats = [
    { icon: Beaker, label: t('home.stats_labs'), value: labs.length || live?.labs || INSTITUTE_STAFF.labs },
    { icon: GraduationCap, label: t('home.stats_scientists'), value: about?.stats.scientists ?? INSTITUTE_STAFF.scientists },
    { icon: Users, label: t('home.stats_staff'), value: about?.stats.staff ?? INSTITUTE_STAFF.total },
    { icon: BookOpen, label: t('home.stats_publications'), value: live?.publications ?? 0 },
  ];

  const explore = [
    { to: '/management', icon: Landmark, label: t('nav.institute.items.management') },
    { to: '/structure', icon: Network, label: t('nav.institute.items.structure') },
    { to: '/contact', icon: Mail, label: t('nav.contact') },
  ];

  return (
    <>
      <SeoHead title={t('about.title')} description={intro || mission} />

      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden bg-primary-950 text-white">
        {/* Bezak: yorug'lik dog'lari va nozik to'r */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary-500/30 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="container pb-36 pt-16 sm:pt-24">
          <Reveal className="max-w-3xl">
            {foundedYear && (
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-primary-100 backdrop-blur">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent-300 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-300" />
                </span>
                {t('about.since', { year: foundedYear })}
              </p>
            )}
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t('about.title')}
            </h1>
            <p className="mt-4 bg-gradient-to-r from-accent-200 via-accent-300 to-primary-200 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl">
              {tagline}
            </p>
            {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-100">{intro}</p>}
          </Reveal>
        </div>
      </section>

      {/* ───────── Raqamlar (hero ustiga chiqib turadi) ───────── */}
      <section aria-label={t('about.stats_label')} className="container relative z-10 -mt-24">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <li key={label}>
              <Reveal delay={i * 100}>
                <div className="group h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-primary-950/10 transition-transform motion-safe:hover:-translate-y-1">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg shadow-primary-700/30">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="text-4xl font-bold tracking-tight text-primary-900">
                    <CountUp value={value} />
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-600">{label}</div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Missiya va istiqbol ───────── */}
      <section aria-labelledby="about-mission" className="container py-20">
        <SectionHeading id="about-mission" eyebrow={t('about.eyebrow_purpose')} title={t('about.mission_vision')} />
        <div className={clsx('grid gap-6', vision && 'lg:grid-cols-2')}>
          {[
            { icon: Target, title: t('about.mission'), text: mission, tone: 'from-primary-700 to-primary-900' },
            ...(vision ? [{ icon: Eye, title: t('about.vision'), text: vision, tone: 'from-accent-500 to-accent-700' }] : []),
          ].map(({ icon: Icon, title, text, tone }, i) => (
            <Reveal key={title} delay={i * 120}>
              <article className="relative h-full overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-primary-50/60 p-8 sm:p-10">
                <div aria-hidden="true" className={clsx('absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-10', tone)} />
                <div className={clsx('mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', tone)}>
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">{title}</h3>
                <p className="text-lg leading-relaxed text-gray-700">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── Qadriyatlar ───────── */}
      {values.length > 0 && (
        <section aria-labelledby="about-values" className="bg-gray-50 py-20">
          <div className="container">
            <SectionHeading id="about-values" eyebrow={t('about.eyebrow_values')} title={t('about.values')} />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => {
                const Icon = VALUE_ICON_MAP[v.icon];
                return (
                  <li key={i}>
                    <Reveal delay={i * 80} className="h-full">
                      <div className="group h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all motion-safe:hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">{pick(v.title, lang)}</h3>
                        <p className="text-sm leading-relaxed text-gray-600">{pick(v.text, lang)}</p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ───────── Tarix + vaqt chizig'i ───────── */}
      <section aria-labelledby="about-history" className="container py-20">
        <div className={clsx('grid gap-12', milestones.length > 0 && 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
          <div className={clsx(milestones.length > 0 && 'lg:sticky lg:top-24 lg:self-start')}>
            <SectionHeading id="about-history" eyebrow={t('about.eyebrow_history')} title={t('about.history')} />
            <Reveal className="space-y-4 text-lg leading-relaxed text-gray-700">
              {history.map((p, i) => <p key={i}>{p}</p>)}
            </Reveal>
          </div>

          {milestones.length > 0 && (
            <ol className="relative space-y-8 border-l-2 border-transparent pl-8 [border-image:linear-gradient(to_bottom,theme(colors.primary.600),theme(colors.accent.400),transparent)_1]">
              {milestones.map((m, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.6rem] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-primary-700 shadow ring-2 ring-primary-200"
                  />
                  <Reveal delay={60}>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                      <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-sm font-bold text-accent-800">
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        {m.year}
                      </p>
                      <h3 className="text-xl font-semibold text-gray-900">{pick(m.title, lang)}</h3>
                      {pick(m.text, lang) && <p className="mt-2 leading-relaxed text-gray-600">{pick(m.text, lang)}</p>}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ───────── Ilmiy yo'nalishlar (laboratoriyalar) ───────── */}
      {labs.length > 0 && (
        <section aria-labelledby="about-labs" className="relative overflow-hidden bg-primary-950 py-20 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-primary-500/20 blur-3xl" />
          <div className="container relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading id="about-labs" light eyebrow={t('about.eyebrow_research')} title={t('about.research_areas')} />
              <LocalizedLink
                to="/laboratories"
                className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-accent-200 hover:text-white"
              >
                {t('about.all_labs')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LocalizedLink>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {labs.map((lab, i) => (
                <li key={lab.id}>
                  <Reveal delay={i * 70} className="h-full">
                    <LocalizedLink
                      to={`/laboratories/${lab.id}`}
                      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:border-accent-300/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-300"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <span className="font-mono text-3xl font-bold text-accent-300" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <ArrowUpRight className="h-5 w-5 text-primary-200 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 group-hover:text-accent-200" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold leading-snug">{unitName(lab, lang)}</h3>
                    </LocalizedLink>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ───────── Davomi ───────── */}
      <section aria-labelledby="about-explore" className="container py-20">
        <h2 id="about-explore" className="mb-8 text-center text-2xl font-bold text-gray-900">{t('about.explore')}</h2>
        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {explore.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <LocalizedLink
                to={to}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-semibold text-gray-900">{label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-gray-500 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
              </LocalizedLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
