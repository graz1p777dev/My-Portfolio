'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

// =============================
// Simple inline config (edit here)
// =============================
const CONFIG = {
  displayName: 'GrAz1p',
  age: 13,
  codewarsUsername: 'grazip777',
  githubUsername: 'grazip777',
  githubRepoFeatured: {
    name: 'My Django Starter',
    description:
      'A Dockerized Django API template with JWT auth, PostgreSQL, pytest, and GitHub Actions.',
    repoUrl: 'https://github.com/graz1p/django-starter',
    topics: ['Django', 'DRF', 'PostgreSQL', 'Docker', 'Pytest'],
  },
  contacts: {
    github: 'https://github.com/grazip777',
    telegram: 'https://t.me/GrAz1p',
    linkedin: 'https://www.linkedin.com/in/alihan-torebekov-9335a0376/',
    email: 'graz1p777@gmail.com',
  },
  // Accent palette (dark hacker vibe)
  colors: {
    accent: '#23d5ab', // green-teal accent (используем как зелёный дождя)
    accent2: '#00b3ff',
  },
  rain: { density: 1, fontSize: 16, opacity: 0.5 },
};

// =============================
// Utilities
// =============================
const cls = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

// =============================
// Full-screen Binary Rain (portal to <body>) — smooth, cmatrix-like
// =============================
function MatrixRainPortal() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const host = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  // создаём слой под контентом
  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-matrix-rain', '');
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '1', // всё ещё ниже твоего контента (у тебя z-10), но поверх body
      pointerEvents: 'none',
      overflow: 'hidden',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(el);
    host.current = el;
    setReady(true);
    return () => {
      try {
        if (host.current && host.current.parentElement)
          host.current.parentElement.removeChild(host.current);
      } catch {}
    };
  }, []);

  // анимация
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const C = ctx as CanvasRenderingContext2D;

    // параметры
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const FONT = CONFIG.rain?.fontSize ?? 16; // размер символа
    const CHARSET = '01';
    const GREEN = CONFIG.colors.accent || '#23d5ab';

    // для эффекта шлейфа cmatrix: лёгкое затухание по кадрам
    const trailAlphaDark = 0.08; // тьма — чуть гуще шлейф
    const trailAlphaLight = 0.04; // светлая — легче шлейф

    let width = 0,
      height = 0;
    let columns = 0;
    let drops: number[] = [];
    let speeds: number[] = [];

    const veilAlpha = () =>
      document.documentElement.classList.contains('dark') ? trailAlphaDark : trailAlphaLight;

    const pick = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      width = w;
      height = h;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
  C.setTransform(DPR, 0, 0, DPR, 0, 0);
  C.font = `${FONT}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

      columns = Math.max(1, Math.floor(width / FONT));
      // стартовые позиции и скорости
      drops = Array.from({ length: columns }, () => Math.random() * (height / FONT));
      // скорость каждой колонки — для «живости»
      speeds = Array.from(
        { length: columns },
        () => 0.9 + Math.random() * 0.7 // 0.9—1.6 строк за кадр
      );
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize, { passive: true });
    resize();

    // цветовая голова/хвост
    function setHeadFill(yPx: number) {
      // «голова» — светлее, почти бело-зелёная
  const head = C.createLinearGradient(0, yPx - FONT * 1.2, 0, yPx + FONT * 0.8);
      head.addColorStop(0, `${GREEN}AA`);
      head.addColorStop(1, '#ccffcc'); // светлый кончик
  C.fillStyle = head;
    }
    function setTailFill() {
      // хвост символов — обычный зелёный
  C.fillStyle = GREEN;
    }

    let raf: number | null = null;

    function draw() {
      // полупрозрачная заливка — создаёт «шлейф» и не перекрывает контент
  C.fillStyle = `rgba(0,0,0,${veilAlpha()})`;
  C.fillRect(0, 0, width, height);

  C.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const yPx = drops[i] * FONT;
        const xPx = i * FONT;

        // хвост (предыдущая позиция)
        setTailFill();
  C.fillText(pick(), xPx, yPx - FONT);

        // голова — ярче
        setHeadFill(yPx);
  C.fillText(pick(), xPx, yPx);

        // движение вниз
        drops[i] += speeds[i];

        // редкий сброс в начало (как капля)
        if (yPx > height + FONT && Math.random() > 0.975) {
          drops[i] = -Math.random() * 20;
          speeds[i] = 0.9 + Math.random() * 0.7;
        }
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  if (!ready) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />,
    host.current as HTMLDivElement
  );
}

// =============================
// Theme Toggle (dark/light)
// =============================
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return (
      localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      className={cls(
        'rounded-xl border px-3 py-2 text-sm transition active:scale-95',
        'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
        className
      )}
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        localStorage.setItem('theme', next);
        setTheme(next);
      }}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

// =============================
// NOTE: Scramble & ScrambleInView заменены MatrixText/MatrixInView (быстрые)
// =============================
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
    seen ? React.createElement(MatrixText, { text, scrambleCycles, frameMs, charset }) : text
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
        <div className="text-2xl" aria-hidden>
          {icon}
        </div>
        <div className="font-mono text-sm tracking-wide text-zinc-200">{label}</div>
      </div>
    </div>
  );
}

// Minimal SVG icons to avoid external deps
const Icons = {
  Python: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="#3776AB" d="M12 2c5.5 0 5 4 5 4v3H7V6c0-3 3-4 5-4z" />
      <path fill="#FFD43B" d="M12 22c-5.5 0-5-4-5-4v-3h10v3c0 3-3 4-5 4z" />
      <circle cx="9.5" cy="5.5" r="1" fill="#fff" />
      <circle cx="14.5" cy="18.5" r="1" fill="#000" />
    </svg>
  ),
  Django: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="#0c4b33" d="M5 3h6v18H8V6H5V3zm9 0h5v3h-2v15h-3V3z" />
    </svg>
  ),
  FastAPI: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" fill="#05998b" />
      <path d="M12 6v12M8 10h8M8 14h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Flask: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path
        d="M18 3s-2 9-12 13c0 0-.5 3 3 5 0 0 11-6 9-18z"
        fill="#fff"
        stroke="#111"
        strokeWidth="1.5"
      />
    </svg>
  ),
  Docker: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect x="3" y="10" width="3" height="3" fill="#2496ed" />
      <rect x="7" y="10" width="3" height="3" fill="#2496ed" />
      <rect x="11" y="10" width="3" height="3" fill="#2496ed" />
      <rect x="7" y="6" width="3" height="3" fill="#2496ed" />
      <rect x="11" y="6" width="3" height="3" fill="#2496ed" />
      <path d="M3 14c0 0 0 4 6 4h6c6 0 6-4 6-4H3z" fill="#2496ed" />
    </svg>
  ),
  JS: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect width="24" height="24" rx="4" fill="#f7df1e" />
      <path
        d="M10 7h3v10c0 2-1 3-3 3H8v-3h2v-10zM16 17c0 1 .8 2 2 2 1.2 0 2-.8 2-2 0-1-.6-1.6-2-2-2-.6-3-1.4-3-3 0-2 1.8-3 3.5-3 1.2 0 2.1.3 2.5.6l-.8 2c-.3-.2-.9-.5-1.7-.5-1 0-1.7.6-1.7 1.3 0 .8.7 1.1 1.9 1.5 2 .7 3.1 1.6 3.1 3.6 0 2.2-1.7 3.6-4.3 3.6-1.5 0-2.6-.4-3.3-.9l.8-2.2c.6.3 1.4.6 2.5.6z"
        fill="#000"
      />
    </svg>
  ),
  HTML: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="#e34f26" d="M3 2l2 18 7 2 7-2 2-18H3z" />
      <path fill="#fff" d="M12 19l5-1 1-12H6l.2 2h9.6l-.2 2H6.6l.3 2h8.5l-.3 3-3.9 1.1" />
    </svg>
  ),
  CSS: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="#264de4" d="M3 2l2 18 7 2 7-2 2-18H3z" />
      <path fill="#fff" d="M12 19l5-1 .7-8H7.4l.2 2h8.8l-.3 3-3.9 1.1" />
    </svg>
  ),
  SQLite: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#0e76a8" />
      <path d="M7 17V7h10" stroke="#fff" strokeWidth="2" />
    </svg>
  ),
  PostgreSQL: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M12 3c6 0 8 3 8 6 0 5-4 8-8 8S4 14 4 9c0-3 2-6 8-6z" fill="#336791" />
      <path d="M9 11c0-1 .8-2 3-2s3 1 3 2-1 2-3 2-3-1-3-2z" fill="#fff" />
    </svg>
  ),
  Pytest: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <circle cx="8" cy="12" r="5" fill="#0a9edc" />
      <circle cx="16" cy="12" r="5" fill="#5aa02c" />
      <circle cx="12" cy="12" r="3" fill="#fff" />
    </svg>
  ),
  Telebot: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" fill="#2aabee" />
      <path d="M6 12l12-5-2.5 10-5-3-2.5 3v-4.5z" fill="#fff" />
    </svg>
  ),
  CSV: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect x="4" y="3" width="16" height="18" rx="2" fill="#16a34a" />
      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="ui-monospace">
        CSV
      </text>
    </svg>
  ),
};

// =============================
// GitHub Widgets (lightweight)
// =============================
function GitHubLive() {
  const user = CONFIG.githubUsername;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_60px_rgba(0,0,0,0.5)]">
      <div className="text-sm text-zinc-400">
        Contributions & repos update automatically from GitHub.
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-4">
          <div className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
            Contributions
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
            Profile
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
                <div className="text-sm text-zinc-400">See repositories & activity</div>
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
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
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
// Main App
// =============================
export default function Portfolio() {
  const accent = CONFIG.colors.accent;
  const accent2 = CONFIG.colors.accent2;

  // Smooth scroll offset for fixed header
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id) return;
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }, []);

  const skills = useMemo(
    () => [
      { label: 'Python', icon: Icons.Python },
      { label: 'Django', icon: Icons.Django },
      { label: 'FastAPI', icon: Icons.FastAPI },
      { label: 'Flask', icon: Icons.Flask },
      { label: 'Docker', icon: Icons.Docker },
      { label: 'JavaScript', icon: Icons.JS },
      { label: 'HTML', icon: Icons.HTML },
      { label: 'CSS', icon: Icons.CSS },
      { label: 'SQLite', icon: Icons.SQLite },
      { label: 'PostgreSQL', icon: Icons.PostgreSQL },
      { label: 'Pytest', icon: Icons.Pytest },
      { label: 'Telebot', icon: Icons.Telebot },
      { label: 'CSV / ETL', icon: Icons.CSV },
    ],
    []
  );

  return (
  <div className="relative z-10 min-h-screen scroll-smooth bg-zinc-50/70 text-zinc-900 antialiased dark:bg-[#0b0b0d]/70 dark:text-zinc-100">
      {/* Full-screen matrix rain behind all content */}
      <MatrixRainPortal />

      {/* Fixed Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 dark:border-zinc-800/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#home" className="font-mono text-sm tracking-widest text-zinc-300">
            {CONFIG.displayName}
          </a>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <a className="hover:text-white" href="#about">
              About
            </a>
            <a className="hover:text-white" href="#skills">
              Skills
            </a>
            <a className="hover:text-white" href="#projects">
              Projects
            </a>
            <a className="hover:text-white" href="#github">
              GitHub
            </a>
            <a className="hover:text-white" href="#contact">
              Contact
            </a>
            <ThemeToggle />
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
            Open to real projects
          </div>

          <h1 className="font-extrabold tracking-tight">
            <span className="block text-3xl text-zinc-400">Python</span>
            <span className="bg-gradient-to-r from-[var(--c1)] to-[var(--c2)] bg-clip-text text-5xl text-transparent sm:text-6xl">
              Backend Developer
            </span>
          </h1>

          <MatrixInView as="p" className="max-w-2xl text-zinc-300 sm:text-lg">
            I design and build clean, tested backends with Django, Docker and Pytest.
          </MatrixInView>

          <div className="flex flex-wrap gap-3">
            <a
              href={CONFIG.contacts.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
            >
              View GitHub →
            </a>
            <a
              href="#contact"
              className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-300 transition hover:bg-teal-500/20"
            >
              Contact Me
            </a>
          </div>

          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
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
            <MatrixText text="About" />
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
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-zinc-400">Primary Focus</div>
                <div className="text-zinc-200">Django • Testing • APIs</div>
                <div className="text-zinc-400">Learning</div>
                <div className="text-zinc-200">System design basics, CI/CD</div>
                <div className="text-zinc-400">Available</div>
                <div className="text-zinc-200">Part-time remote / project-based</div>
                <div className="text-zinc-400">Languages</div>
                <div className="text-zinc-200">English only</div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="scroll-mt-24 py-16">
          <h2 className="mb-6 text-2xl font-semibold">
            <MatrixText text="Skills" />
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

        {/* Projects */}
        <section id="projects" className="scroll-mt-24 py-16">
          <h2 className="mb-3 text-2xl font-semibold">
            <MatrixText text="Projects" />
          </h2>
          <MatrixInView as="p" className="mb-6 max-w-2xl text-sm text-zinc-400">
            I’m currently learning and haven’t shipped client projects yet, but I’m ready to take
            them on. Here’s what I’m building now.
          </MatrixInView>
          <RepoCard />
        </section>

        {/* GitHub Live + Codewars */}
        <section id="github" className="scroll-mt-24 py-16">
          <h2 className="mb-6 text-2xl font-semibold">
            <MatrixText text="GitHub Live" />
          </h2>
          <GitHubLive />
          <div className="mt-6">
            <CodewarsCard />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-24 py-16">
          <h2 className="mb-6 text-2xl font-semibold">
            <MatrixText text="Contact" />
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="mb-2 text-sm text-zinc-400">GitHub</div>
              <div className="mb-3 truncate text-zinc-200">{CONFIG.contacts.github}</div>
              <div className="flex gap-2">
                <a
                  className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm"
                  href={CONFIG.contacts.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
                <CopyButton value={CONFIG.contacts.github}>Copy</CopyButton>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="mb-2 text-sm text-zinc-400">Telegram</div>
              <div className="mb-3 truncate text-zinc-200">{CONFIG.contacts.telegram}</div>
              <div className="flex gap-2">
                <a
                  className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm"
                  href={CONFIG.contacts.telegram}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
                <CopyButton value={CONFIG.contacts.telegram}>Copy</CopyButton>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="mb-2 text-sm text-zinc-400">LinkedIn</div>
              <div className="mb-3 truncate text-zinc-200">{CONFIG.contacts.linkedin}</div>
              <div className="flex gap-2">
                <a
                  className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm"
                  href={CONFIG.contacts.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
                <CopyButton value={CONFIG.contacts.linkedin}>Copy</CopyButton>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="mb-2 text-sm text-zinc-400">Email</div>
              <div className="mb-3 truncate text-zinc-200">{CONFIG.contacts.email}</div>
              <div className="flex gap-2">
                <a
                  className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm"
                  href={`mailto:${CONFIG.contacts.email}`}
                >
                  Open
                </a>
                <CopyButton value={CONFIG.contacts.email}>Copy</CopyButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (тумблер удалён, как просил) */}
      <footer className="border-t border-zinc-800/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="text-sm text-zinc-400">
            © {new Date().getFullYear()} {CONFIG.displayName}. Built with Python love 🐍
          </div>
        </div>
      </footer>

      {/* Accessibility helpers */}
      <a href="#home" className="sr-only">
        Back to top
      </a>
    </div>
  );
}
