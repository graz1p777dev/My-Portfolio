'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { RESUME_TEXT_RU, RESUME_TEXT_ENG } from './data/resume';

/**
 * Portfolio Configuration
 * =============================
 * Customize your portfolio by editing this object.
 * Asset paths: /public/matrix-rain.webm, /public/icons/*.svg
 * Colors: CONFIG.colors.accent (primary), CONFIG.colors.accent2 (secondary)
 */
const CONFIG = {
  displayName: 'Alihan Torebekov',
  age: 13,
  codewarsUsername: 'graz1p777dev',
  githubUsername: 'graz1p777dev',
  githubRepoFeatured: {
    name: 'Stroy kg',
    description:
      'A Dockerized Django API template with JWT auth, PostgreSQL, pytest, and GitHub Actions.(this project is private)',
    repoUrl: 'https://github.com/graz1p/stroy-kg',
    topics: ['Django', 'DRF', 'PostgreSQL', 'Docker', 'Pytest'],
  },
  contacts: {
    github: 'https://github.com/graz1p777dev',
    telegram: 'https://t.me/graz1p',
    linkedin: 'https://linkedin.com/in/alihan-torebekov-9335a0376',
    email: 'graz1p@proton.me',
  },
  // PRIMARY COLORS: Change these to customize the entire site's accent colors
  // accent: Primary neon color (used in gradient, borders, glows)
  // accent2: Secondary color (used in gradients)
  colors: {
    accent: '#23d5ab',
    accent2: '#00b3ff',
  },
  // Background animation: /public/matrix-rain.webm and /public/matrix-rain.mp4
  // Adjust rain settings below for performance tuning
  rain: {
    density: 0.55,
    fontSize: 16,
    maxFps: 30,
    dpr: 1.25,
  },
};

// =============================
// Utilities
// =============================
const cls = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

// Locale context (ru/en)
const LocaleContext = React.createContext<{
  locale: 'ru' | 'en';
  setLocale: (l: 'ru' | 'en') => void;
}>({ locale: 'en', setLocale: () => {} });

function useLocale() {
  return React.useContext(LocaleContext);
}

function useT() {
  const { locale } = useLocale();
  return (en: string, ru: string) => (locale === 'ru' ? ru : en);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/**
 * =============================
 * Translations & Localization
 * =============================
 * TEXTS object stores all translatable strings
 * Format: 'English text': { en: 'English', ru: 'Russian' }
 * Usage: t('English text') returns translated text based on current locale
 * Add new translation by:
 * 1. Adding key-value pair to TEXTS object
 * 2. Using t('key') in components
 * 3. The hook useT() provides t() function with access to current locale
 */
const TEXTS: Record<string, { en: string; ru: string }> = {
  'Open to real projects': { en: 'Open to real projects', ru: 'Открыт для реальных проектов' },
  'I design and build clean, tested backends with Django, Docker and Pytest.': {
    en: 'I design and build clean, tested backends with Django, Docker and Pytest.',
    ru: 'Я проектирую и строю аккуратные, протестированные бэкенды на Django, Docker и Pytest.',
  },
  'Alihan Torebekov': { en: 'Alihan Torebekov', ru: 'Алихан Торебеков' },
  'View GitHub →': { en: 'View GitHub →', ru: 'Посмотреть GitHub →' },
  'Contact Me': { en: 'Contact Me', ru: 'Связаться' },
  'Contributions & repos update automatically from GitHub.': {
    en: 'Contributions & repos update automatically from GitHub.',
    ru: 'Вклады и репозитории обновляются автоматически из GitHub.',
  },
  Contributions: { en: 'Contributions', ru: 'Вклады' },
  Profile: { en: 'Profile', ru: 'Профиль' },
  'See repositories & activity': {
    en: 'See repositories & activity',
    ru: 'Смотреть репозитории и активность',
  },

  // small UI pieces already using `t(...)` but keep centralized keys too
  About: { en: 'About', ru: 'Обо мне' },
  Skills: { en: 'Skills', ru: 'Навыки' },
  Projects: { en: 'Projects', ru: 'Проекты' },
  Contact: { en: 'Contact', ru: 'Контакты' },
  'GitHub Live': { en: 'GitHub Live', ru: 'GitHub активность' },
  Resume: { en: 'Resume', ru: 'Резюме' },
  'My Resume': { en: 'My Resume', ru: 'Моё резюме' },
  'Language:': { en: 'Language:', ru: 'Язык:' },
  Download: { en: 'Download', ru: 'Скачать' },
  Copy: { en: 'Copy', ru: 'Копировать' },
  'I’m currently learning and haven’t shipped client projects yet, but I’m ready to take them on. Here’s what I’m building now.':
    {
      en: 'I’m currently learning and haven’t shipped client projects yet, but I’m ready to take them on. Here’s what I’m building now.',
      ru: 'В данный момент я учусь и пока не публиковал клиентские проекты, но готов взяться за них. Вот что я сейчас создаю.',
    },
  'A Dockerized Django API template with JWT auth, PostgreSQL, pytest, and GitHub Actions.': {
    en: 'A Dockerized Django API template with JWT auth, PostgreSQL, pytest, and GitHub Actions.',
    ru: 'Docker-шаблон Django API с JWT-аутентификацией, PostgreSQL, pytest и GitHub Actions.',
  },
  GitHub: { en: 'GitHub', ru: 'GitHub' },
  Telegram: { en: 'Telegram', ru: 'Telegram' },
  LinkedIn: { en: 'LinkedIn', ru: 'LinkedIn' },
  Email: { en: 'Email', ru: 'Электронная почта' },
  Open: { en: 'Open', ru: 'Открыть' },
};

/**
 * =============================
 * Background Animation Component
 * =============================
 * Displays full-screen matrix rain video background
 * Videos stored at: /public/matrix-rain.webm, /public/matrix-rain.mp4
 * Respects user's motion preference settings (prefers-reduced-motion)
 */
function MatrixRainPortalVideo() {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '1', // Content appears above video (z-10)
      pointerEvents: 'none',
      overflow: 'hidden',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(el);
    host.current = el;
    setReady(true);
    return () => {
      try {
        el.remove();
      } catch {}
    };
  }, [reduced]);

  if (reduced || !ready || !host.current) return null;

  return createPortal(
    <video
      aria-hidden
      playsInline
      autoPlay
      muted
      loop
      preload="auto"
      poster="/matrix-rain-poster.jpg"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'none',
      }}
    >
      <source src="/matrix-rain.webm" type="video/webm" />
      <source src="/matrix-rain.mp4" type="video/mp4" />
    </video>,
    host.current
  );
}

/**
 * =============================
 * Text Animation Components
 * =============================
 * Provides animated text reveal effects and scroll-triggered animations
 * MatrixTextFast: Quick character-by-character text reveal
 * MatrixInView: Triggers animation when element enters viewport
 */
function useInViewOnce(ref: React.RefObject<Element>, threshold = 0.25) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}
const BINARY_CHARS = '01';

function MatrixTextFast({
  text,
  className = '',
  step = 3,
  frameMs = 12,
  charset = BINARY_CHARS,
}: {
  text: string;
  className?: string;
  step?: number;
  frameMs?: number;
  charset?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState<string>(text);

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }

    const len = text.length;
    let fixed = 0;
    const pick = () => charset[Math.floor(Math.random() * charset.length)];

    const tick = () => {
      if (fixed >= len) {
        setOut(text);
        if (id) clearInterval(id);
        return;
      }
      fixed += step;

      const parts: string[] = new Array(len);
      for (let i = 0; i < len; i++) {
        if (text[i] === ' ') {
          parts[i] = ' ';
          continue;
        }
        if (i < fixed) {
          parts[i] = `<span class="text-zinc-100">${text[i]}</span>`;
        } else {
          parts[i] = `<span class="text-[${CONFIG.colors.accent}]">${pick()}</span>`;
        }
      }
      setOut(parts.join(''));
    };

    let id: number | null = null;
    id = window.setInterval(tick, frameMs);
    return () => {
      if (id) clearInterval(id);
    };
  }, [text, step, frameMs, reduced, charset]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: out }} />;
}

function MatrixText({
  text,
  className = '',
  scrambleCycles = 2,
  frameMs = 14,
  revealStep = 2,
  charset = BINARY_CHARS,
}: {
  text: string;
  className?: string;
  scrambleCycles?: number;
  frameMs?: number;
  revealStep?: number;
  charset?: string;
}) {
  const step = revealStep ?? scrambleCycles ?? 2;
  return (
    <MatrixTextFast
      text={text}
      className={className}
      step={step}
      frameMs={frameMs ?? 14}
      charset={charset}
    />
  );
}

function MatrixInView({
  as = 'p',
  className = '',
  children,
  scrambleCycles = 3,
  frameMs = 24,
  charset = BINARY_CHARS,
}: {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  scrambleCycles?: number;
  frameMs?: number;
  charset?: string;
}) {
  const Tag: React.ElementType = as || 'p';
  const ref = useRef<HTMLElement | null>(null);
  const seen = useInViewOnce(ref as React.RefObject<Element>, 0.2);
  const text = typeof children === 'string' ? (children as string) : '';

  return React.createElement(
    Tag,
    { ref: ref as unknown as React.RefObject<HTMLElement>, className },
    seen
      ? React.createElement(MatrixText, {
          text,
          scrambleCycles,
          frameMs,
          charset,
        })
      : text
  );
}

// =============================
// Skill Key (pressable)
// =============================
function SkillKey({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div
      className={cls(
        'group relative select-none rounded-2xl border bg-gradient-to-b from-zinc-900/70 to-zinc-900/30 p-4',
        'border-zinc-800 text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.35)]',
        'transition-transform will-change-transform',
        'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(35,213,171,0.16)] active:translate-y-0.5'
      )}
      style={{
        backgroundImage:
          'linear-gradient(to bottom, rgba(36,36,36,.7), rgba(18,18,18,.3)), radial-gradient(1200px 300px at 0% -10%, rgba(35,213,171,.2), transparent)',
      }}
      role="listitem"
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl" aria-hidden={true}>
          {icon}
        </div>
        <div className="font-mono text-sm tracking-wide text-zinc-200">{label}</div>
      </div>
    </div>
  );
}

// Icon components - using Image component for SVG icons
// All icons are stored in /public/icons/ directory
// Format: SVG files, each skill has a corresponding icon file
const IconImg = ({ src, alt = '' }: { src: string; alt?: string }) => (
  <Image
    src={src}
    alt={alt}
    width={24}
    height={24}
    className="h-6 w-6"
    unoptimized
    priority={false}
  />
);

/**
 * Skill Icons Map
 * Add new icons by:
 * 1. Adding SVG file to /public/icons/skillname.svg
 * 2. Adding entry below: SkillName: <IconImg src="/icons/skillname.svg" />
 */
const Icons = {
  Python: <IconImg src="/icons/python.svg" />,
  Django: <IconImg src="/icons/django.svg" />,
  FastAPI: <IconImg src="/icons/fastapi.svg" />,
  Flask: <IconImg src="/icons/flask.svg" />,
  Docker: <IconImg src="/icons/docker.svg" />,
  HTML: <IconImg src="/icons/html.svg" />,
  CSS: <IconImg src="/icons/css.svg" />,
  SQLite: <IconImg src="/icons/sqlite.svg" />,
  PostgreSQL: <IconImg src="/icons/postgresql.svg" />,
  Pytest: <IconImg src="/icons/pytest.svg" />,
  Telebot: <IconImg src="/icons/telebot.svg" />,
  Linux: <IconImg src="/icons/linux.svg" />,
};

/**
 * =============================
 * External Data Components
 * =============================
 * Components that fetch or display external data
 */
// =============================
function GitHubLive() {
  const t = useT();
  const user = CONFIG.githubUsername;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_60px_rgba(0,0,0,0.5)]">
      <div className="text-sm text-zinc-400">
        {t(
          'Contributions & repos update automatically from GitHub.',
          'Вклады и репозитории обновляются автоматически из GitHub.'
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-4">
          <div className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
            {t('Contributions', 'Вклады')}
          </div>
          <div className="relative h-40 overflow-hidden rounded-lg bg-zinc-900">
            <Image
              src={`https://ghchart.rshah.org/${CONFIG.colors.accent.replace('#', '')}/${user}`}
              alt="GitHub contribution chart"
              className="h-full w-full object-cover"
              fill
              unoptimized
            />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 p-4">
          <div className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
            {t('Profile', 'Профиль')}
          </div>
          <a
            href={`https://github.com/${user}`}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-lg bg-zinc-900/60 p-4 ring-1 ring-inset ring-zinc-800 transition hover:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-zinc-100">github.com/{user}</div>
                <div className="text-sm text-zinc-400">
                  {t('See repositories & activity', 'Смотреть репозитории и активность')}
                </div>
              </div>
              <span className="translate-x-0 text-zinc-400 transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// Types for CodewarsCard
interface Rank {
  name?: string;
  color?: string;
  score?: number;
}
interface CodewarsData {
  username?: string;
  name?: string;
  clan?: string;
  honor?: number;
  leaderboardPosition?: number;
  codeChallenges?: { totalCompleted?: number };
  ranks?: { overall?: Rank; languages?: Record<string, Rank | undefined> };
}
function CodewarsCard() {
  const username = CONFIG.codewarsUsername;
  const [data, setData] = useState<CodewarsData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/codewars?u=${encodeURIComponent(username)}`);
        if (!r.ok) throw new Error(`HTc    TP ${r.status}`);
        const j = (await r.json()) as CodewarsData;
        if (alive) setData(j);
      } catch (e: unknown) {
        if (alive) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [username]);

  const RankPill = ({ label, rank }: { label: string; rank?: Rank }) => {
    if (!rank) return null;
    const { name, color, score } = rank;
    const bg = color ? `${color}33` : 'rgba(0,0,0,0.2)';
    const border = color ? `${color}66` : 'rgba(255,255,255,0.1)';
    return (
      <div
        className="rounded-lg px-3 py-2 text-sm"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <div className="text-zinc-300">{label}</div>
        <div className="font-medium text-zinc-100">
          {name} <span className="text-zinc-400">({score})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400">Codewars</div>
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 rounded bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-zinc-800" />
            ))}
          </div>
        </div>
      )}
      {err && <div className="text-sm text-red-400">Failed to load Codewars: {err}</div>}
      {data && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <a
              className="text-lg font-semibold text-zinc-100 hover:underline"
              href={`https://www.codewars.com/users/${data.username}`}
              target="_blank"
              rel="noreferrer"
            >
              {data.name || data.username}
            </a>
            {data.clan && (
              <span className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
                {data.clan}
              </span>
            )}
          </div>
          <div className="flex gap-4 text-sm text-zinc-300">
            <div>
              Honor:{' '}
              <span className="font-medium text-zinc-100">
                {data.honor?.toLocaleString?.() ?? data.honor}
              </span>
            </div>
            {typeof data.leaderboardPosition === 'number' && (
              <div>
                Leaderboard:{' '}
                <span className="font-medium text-zinc-100">#{data.leaderboardPosition}</span>
              </div>
            )}
            {data.codeChallenges?.totalCompleted != null && (
              <div>
                Completed:{' '}
                <span className="font-medium text-zinc-100">
                  {data.codeChallenges.totalCompleted}
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RankPill label="Overall" rank={data.ranks?.overall} />
            <RankPill label="Python" rank={data.ranks?.languages?.python} />
            <RankPill label="JavaScript" rank={data.ranks?.languages?.javascript} />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================
// Copy button
// =============================
function CopyButton({ value, children }: { value: string; children?: React.ReactNode }) {
  const [ok, setOk] = useState<boolean>(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {}
      }}
      className={cls(
        'rounded-lg border px-3 py-2 text-sm transition active:scale-95',
        'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-900'
      )}
    >
      {ok ? 'Copied!' : children}
    </button>
  );
}

function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-zinc-900/40 p-1">
      <button
        onClick={() => setLocale('ru')}
        className={cls(
          'px-3 py-1 text-sm font-medium rounded-full transition',
          locale === 'ru' ? 'bg-[rgba(35,213,171,0.16)] text-zinc-100' : 'text-zinc-300'
        )}
        aria-pressed={locale === 'ru'}
      >
        RU
      </button>
      <button
        onClick={() => setLocale('en')}
        className={cls(
          'px-3 py-1 text-sm font-medium rounded-full transition',
          locale === 'en' ? 'bg-[rgba(0,179,255,0.12)] text-zinc-100' : 'text-zinc-300'
        )}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}

// =============================
// Featured Repo Card (static, links to GitHub)
// =============================
function RepoCard() {
  const r = CONFIG.githubRepoFeatured;
  return (
    <a
      href={r.repoUrl}
      target="_blank"
      rel="noreferrer"
      className={cls(
        'block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5',
        'transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(0,179,255,0.15)]'
      )}
    >
      <div className="mb-2 text-lg font-semibold text-zinc-100">{r.name}</div>
      <MatrixInView as="div" className="mb-3 text-sm text-zinc-300">
        {r.description}
      </MatrixInView>
      <div className="flex flex-wrap gap-2">
        {r.topics.map((t) => (
          <span
            key={t}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

// =============================
// Resume Interactive Block
// =============================
function ResumeBlock() {
  const [lang, setLang] = useState<'ru' | 'en'>('en');
  const text = lang === 'ru' ? RESUME_TEXT_RU : RESUME_TEXT_ENG;
  const t = useT();

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${lang}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_60px_rgba(0,0,0,0.5)]">
      <div className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
        {t('Resume', 'Резюме')}
      </div>
      <div className="mb-4 text-xl font-semibold text-zinc-100">{t('My Resume', 'Моё резюме')}</div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-zinc-400">{t('Language:', 'Язык:')}</span>
        <button
          onClick={() => setLang('en')}
          className={cls(
            'rounded-md border px-3 py-1 text-sm transition',
            lang === 'en'
              ? 'border-teal-400/60 bg-teal-400/10 text-teal-200'
              : 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900'
          )}
        >
          EN
        </button>
        <button
          onClick={() => setLang('ru')}
          className={cls(
            'rounded-md border px-3 py-1 text-sm transition',
            lang === 'ru'
              ? 'border-teal-400/60 bg-teal-400/10 text-teal-200'
              : 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900'
          )}
        >
          RU
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={download}
          className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
        >
          {t('Download', 'Скачать')}
        </button>
        <button
          onClick={copy}
          className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
        >
          {t('Copy', 'Копировать')}
        </button>
      </div>
    </div>
  );
}

// =============================
// Main App
// =============================
export default function Portfolio() {
  const accent = CONFIG.colors.accent;
  const accent2 = CONFIG.colors.accent2;
  const [locale, setLocale] = useState<'ru' | 'en'>('en');
  const t = (keyOrEn: string, maybeRu?: string) => {
    const found = TEXTS[keyOrEn as keyof typeof TEXTS];
    if (found) return locale === 'ru' ? found.ru : found.en;
    if (maybeRu !== undefined) return locale === 'ru' ? maybeRu : keyOrEn;
    return keyOrEn;
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('locale');
      if (stored === 'ru' || stored === 'en') setLocale(stored);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale);
    } catch {}
  }, [locale]);

  // Smooth scroll offset for fixed header
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const handlers = new Map<HTMLAnchorElement, EventListener>();
    links.forEach((a) => {
      const handler = (e: Event) => {
        const id = a.getAttribute('href');
        if (!id) return;
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      };
      a.addEventListener('click', handler);
      handlers.set(a, handler);
    });
    return () => {
      handlers.forEach((h, a) => a.removeEventListener('click', h));
    };
  }, []);

  const skills = useMemo(
    () => [
      { label: 'Python', icon: Icons.Python },
      { label: 'Django', icon: Icons.Django },
      { label: 'FastAPI', icon: Icons.FastAPI },
      { label: 'Flask', icon: Icons.Flask },
      { label: 'Docker', icon: Icons.Docker },
      { label: 'HTML', icon: Icons.HTML },
      { label: 'CSS', icon: Icons.CSS },
      { label: 'SQLite', icon: Icons.SQLite },
      { label: 'PostgreSQL', icon: Icons.PostgreSQL },
      { label: 'Pytest', icon: Icons.Pytest },
      { label: 'Telebot', icon: Icons.Telebot },
      { label: 'Linux', icon: Icons.Linux },
    ],
    []
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <div className="relative z-10 min-h-screen scroll-smooth bg-zinc-50/70 text-zinc-900 antialiased dark:bg-[#0b0b0d]/70 dark:text-zinc-100">
        {/* Full-screen matrix rain behind all content */}
        <MatrixRainPortalVideo />

        {/* Fixed Nav */}
        <header className="sticky top-0 z-40 border-b border-zinc-200/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 dark:border-zinc-800/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <a href="#home" className="font-mono text-sm tracking-widest text-zinc-300">
                {t(CONFIG.displayName)}
              </a>
              <LanguageToggle />
            </div>
            <nav className="flex items-center gap-4 text-sm text-zinc-300">
              <a className="hover:text-white" href="#about">
                {t('About', 'Обо мне')}
              </a>
              <a className="hover:text-white" href="#skills">
                {t('Skills', 'Навыки')}
              </a>
              <a className="hover:text-white" href="#projects">
                {t('Projects', 'Проекты')}
              </a>
              <a className="hover:text-white" href="#github">
                GitHub
              </a>
              <a className="hover:text-white" href="#contact">
                {t('Contact', 'Контакты')}
              </a>
              {/* Theme toggle removed per request */}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4">
          {/* Hero */}
          <section
            id="home"
            className="relative flex min-h-[70vh] flex-col justify-center gap-6 py-16"
          >
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800/80 bg-zinc-900/50 px-3 py-1 text-[11px] font-medium text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              {t('Open to real projects')}
            </div>

            <h1 className="font-extrabold tracking-tight">
              <span className="block text-3xl text-zinc-400">Python</span>
              <span className="bg-gradient-to-r from-[var(--c1)] to-[var(--c2)] bg-clip-text text-5xl text-transparent sm:text-6xl">
                Backend Developer
              </span>
            </h1>

            <MatrixInView as="p" className="max-w-2xl text-zinc-300 sm:text-lg">
              {t('I design and build clean, tested backends with Django, Docker and Pytest.')}
            </MatrixInView>

            <div className="flex flex-wrap gap-3">
              <a
                href={CONFIG.contacts.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
              >
                {t('View GitHub →')}
              </a>
              <a
                href="#contact"
                className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-300 transition hover:bg-teal-500/20"
              >
                {t('Contact Me')}
              </a>
            </div>

            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden={true}>
              <div
                className="absolute left-1/2 top-1/2 h=[420px] w=[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{ background: `${accent}22` }}
              />
            </div>

            <style>{`:root{--c1:${accent};--c2:${accent2}}`}</style>
          </section>

          {/* About */}
          <section id="about" className="scroll-mt-24 py-16">
            <h2 className="mb-6 text-2xl font-semibold">
              <MatrixText text={t('About', 'Обо мне')} />
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 leading-relaxed text-zinc-300">
                <MatrixInView as="p">
                  Hi! I’m {CONFIG.displayName}, a {CONFIG.age}-year-old Python backend developer
                  focused on Django and testing. I’m still learning and haven’t shipped client
                  projects yet — but I’m ready to take them on and deliver clean, reliable code.
                </MatrixInView>
                <MatrixInView as="p">
                  My stack: Django (ORM), Pytest, Docker, FastAPI/Flask for microservices,
                  SQLite/PostgreSQL, and solid basics in HTML/CSS/JS for simple frontends.
                </MatrixInView>
              </div>
              <div className="skill-glass rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-zinc-400">Primary Focus</div>
                  <div className="text-zinc-200">Django • Testing • APIs</div>
                  <div className="text-zinc-400">Learning</div>
                  <div className="text-zinc-200">System design basics, CI/CD</div>
                  <div className="text-zinc-400">Available</div>
                  <div className="text-zinc-200">Part-time remote / project-based</div>
                  <div className="text-zinc-400">Languages</div>
                  <div className="text-zinc-200">English and</div>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <div className="skill-glass mb-10">
            <section id="skills" className="scroll-mt-24 py-16">
              <h2 className="mb-6 text-2xl font-semibold">
                <MatrixText text={t('Skills', 'Навыки')} />
              </h2>
              <div
                role="list"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              >
                {skills.map((s) => (
                  <SkillKey key={s.label} label={s.label} icon={s.icon} />
                ))}
              </div>
            </section>
          </div>
          <style jsx>{`
            .skill-glass {
              position: relative;
              padding: 20px;
              border-radius: 20px;
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(10px);
              overflow: hidden;
              isolation: isolate;
            }

            .skill-glass > * {
              position: relative;
              z-index: 3;
            }

            /* Neon animated BORDER instead of full fill */
            .skill-glass::before {
              content: '';
              position: absolute;
              inset: 0;
              padding: 2px;
              border-radius: 20px;
              background: linear-gradient(90deg, #23d5ab, #00b3ff, #23d5ab);
              background-size: 300% 100%;
              animation: borderRun 4s linear infinite;
              pointer-events: none;
              z-index: 2;

              /* keep only border, remove fill */
              -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
            }

            /* Grainy glass layer */
            .skill-glass::after {
              content: '';
              position: absolute;
              inset: 0;
              background: rgba(0, 0, 0, 0.25) url('/noise.png');
              background-size: cover;
              mix-blend-mode: normal;
              z-index: 0;
              pointer-events: none;
            }
            /* skill-glass button variant (Resume buttons) */
            .skill-glass-btn {
              cursor: pointer;
              text-align: center;
              font-weight: 600;
              font-size: 1.05rem;
              color: #e5fef7;

              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }

            .skill-glass-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 35px rgba(35, 213, 171, 0.35);
            }

            .skill-glass-btn:active {
              transform: scale(0.96);
            }
            .resume-step {
              animation: resumeFadeUp 0.28s ease;
            }
            /* Neon outline — reusable */
            .neon-outline {
              position: relative;
              border-radius: 16px;
              background: rgba(15, 15, 18, 0.6);
              backdrop-filter: blur(10px);
              overflow: hidden;
            }

            .neon-outline::before {
              content: '';
              position: absolute;
              inset: 0;
              padding: 2px;
              border-radius: inherit;
              background: linear-gradient(90deg, #23d5ab, #00b3ff, #23d5ab);
              background-size: 300% 100%;
              animation: neonRun 4s linear infinite;
              pointer-events: none;

              -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
            }

            /* === Neon glow variant for buttons (VISIBLE glow) === */
            .neon-btn-glass {
              background: rgba(10, 10, 12, 0.55);
            }

            .neon-btn-glass::before {
              filter: blur(0.8px);
              box-shadow: 0 0 16px rgba(35, 213, 171, 0.85), 0 0 36px rgba(0, 179, 255, 0.65);
            }

            .neon-btn-glass:hover::before {
              box-shadow: 0 0 26px rgba(35, 213, 171, 1), 0 0 60px rgba(0, 179, 255, 0.9);
            }
            /* === REAL NEON GLOW LAYER (no mask) === */
            .neon-btn-glass::after {
              content: '';
              position: absolute;
              inset: -6px;
              border-radius: inherit;
              background: linear-gradient(90deg, #23d5ab, #00b3ff, #23d5ab);
              background-size: 300% 100%;
              animation: borderRun 4s linear infinite;
              filter: blur(14px);
              opacity: 0.55;
              z-index: 1;
              pointer-events: none;
            }

            .neon-btn-glass:hover::after {
              opacity: 0.85;
              filter: blur(18px);
            }

            @keyframes neonRun {
              from {
                background-position: 0% 0;
              }
              to {
                background-position: 300% 0;
              }
            }

            @keyframes spinGlow {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
            @keyframes glowRotate {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
            @keyframes borderRun {
              0% {
                background-position: 0% 0;
              }
              100% {
                background-position: 300% 0;
              }
            }

            @keyframes resumeFadeUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            /* ========== REUSABLE BUTTON CLASSES ========== */
            /* Primary button - dark glass with border */
            .btn-primary {
              border-radius: 0.75rem;
              border: 1px solid #3f3f46;
              background: rgba(24, 24, 27, 0.6);
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              color: #e4e4e7;
              transition: background-color 0.15s ease;
              cursor: pointer;
            }
            .btn-primary:hover {
              background: rgba(24, 24, 27, 0.9);
            }

            /* Label text - consistent styling for card labels */
            .card-label {
              font-size: 0.875rem;
              color: #a1a1a1;
              margin-bottom: 0.75rem;
            }

            .card-value {
              color: #e4e4e7;
              word-break: break-all;
              margin-bottom: 0.75rem;
            }
          `}</style>

          {/* Projects */}
          <div className="skill-glass">
            <section id="projects" className="scroll-mt-24 py-16">
              <h2 className="mb-3 text-2xl font-semibold">
                <MatrixText text={t('Projects', 'Проекты')} />
              </h2>
              <MatrixInView as="p" className="mb-6 max-w-2xl text-sm text-zinc-400">
                {t(
                  'I’m currently learning and haven’t shipped client projects yet, but I’m ready to take them on. Here’s what I’m building now.'
                )}
              </MatrixInView>
              <RepoCard />
            </section>
          </div>

          {/* GitHub Live + Codewars */}
          <section id="github" className="scroll-mt-24 py-16">
            <h2 className="mb-6 text-2xl font-semibold">
              <MatrixText text={t('GitHub Live', 'GitHub активность')} />
            </h2>
            <div className="skill-glass p-4">
              <GitHubLive />
            </div>
            <div className="mt-6">
              <div className="skill-glass p-4">
                <CodewarsCard />
              </div>
            </div>
            <div className="mt-6">
              <div className="skill-glass p-4">
                <ResumeBlock />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="scroll-mt-24 py-16">
            <h2 className="mb-6 text-2xl font-semibold">
              <MatrixText text={t('Contact', 'Контакты')} />
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="skill-glass rounded-xl p-4">
                <div className="card-label">{t('GitHub')}</div>
                <div className="card-value">{CONFIG.contacts.github}</div>
                <div className="flex gap-2">
                  <a
                    className="btn-primary"
                    href={CONFIG.contacts.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('Open')}
                  </a>
                  <CopyButton value={CONFIG.contacts.github}>{t('Copy')}</CopyButton>
                </div>
              </div>
              <div className="skill-glass rounded-xl p-4">
                <div className="card-label">{t('Telegram')}</div>
                <div className="card-value">{CONFIG.contacts.telegram}</div>
                <div className="flex gap-2">
                  <a
                    className="btn-primary"
                    href={CONFIG.contacts.telegram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('Open')}
                  </a>
                  <CopyButton value={CONFIG.contacts.telegram}>{t('Copy')}</CopyButton>
                </div>
              </div>
              <div className="skill-glass rounded-xl p-4">
                <div className="card-label">{t('LinkedIn')}</div>
                <div className="card-value">{CONFIG.contacts.linkedin}</div>
                <div className="flex gap-2">
                  <a
                    className="btn-primary"
                    href={CONFIG.contacts.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('Open')}
                  </a>
                  <CopyButton value={CONFIG.contacts.linkedin}>{t('Copy')}</CopyButton>
                </div>
              </div>
              <div className="skill-glass rounded-xl p-4">
                <div className="card-label">{t('Email')}</div>
                <div className="card-value">{CONFIG.contacts.email}</div>
                <div className="flex gap-2">
                  <a className="btn-primary" href={`mailto:${CONFIG.contacts.email}`}>
                    {t('Open')}
                  </a>
                  <CopyButton value={CONFIG.contacts.email}>{t('Copy')}</CopyButton>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <div className="text-sm text-zinc-400">
              © {new Date().getFullYear()} {t(CONFIG.displayName)}. Built with Python love 🐍
            </div>
            <div className="text-sm text-zinc-400">
              {t('My youtube channel:', 'Мой канал на YouTube:')}{' '}
              <a
                href="https://youtube.com/@graz1p777dev"
                target="_blank"
                rel="noreferrer"
                className="text-teal-300 hover:underline"
              >
                youtube.com/@graz1p777dev
              </a>
            </div>
            <div className="text-sm text-zinc-400">
              <a
                href="https://github.com/graz1p777dev/My-Portfolio"
                target="_blank"
                rel="noreferrer"
                className="text-teal-300 hover:underline"
              >
                This portfolio
              </a>
            </div>
          </div>
        </footer>

        {/* Accessibility helpers */}
        <a href="#home" className="sr-only">
          Back to top
        </a>
      </div>
    </LocaleContext.Provider>
  );
}
